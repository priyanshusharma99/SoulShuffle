import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

class RevenueCatService {
  private static isConfigured = false;

  static async initialize(userId?: string): Promise<void> {
    try {
      if (this.isConfigured) return;

      let Purchases: any = null;
      try {
        Purchases = require('react-native-purchases').default || require('react-native-purchases');
      } catch (e) {
        // Native module unavailable in Expo Go
        console.log('[RevenueCatService] Purchases module not available in standard Expo Go.');
        return;
      }

      const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
      if (isExpoGo) {
        console.log('[RevenueCatService] Skipping init in Expo Go.');
        return;
      }
      const amazonKey = process.env.EXPO_PUBLIC_REVENUECAT_AMAZON_API_KEY || process.env.EXPO_PUBLIC_AMAZON_API_KEY || 'amzn_kizSPIvqSmmcOFLROwJQMlzkmQs';
      const isAmazon = true; // Amazon Appstore Build

      const apiKey = Platform.OS === 'ios' 
        ? (process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY || 'appl_dummy_key')
        : (isAmazon ? amazonKey : (process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY || 'goog_dummy_key'));

      if (Purchases && typeof Purchases.configure === 'function') {
        Purchases.configure({
          apiKey,
          appUserID: userId || undefined,
          useAmazon: isAmazon && Platform.OS === 'android',
        });
        this.isConfigured = true;
      }
    } catch (e) {
      console.log('[RevenueCatService] Init skipped in development:', e);
    }
  }

  static async identify(userId: string): Promise<void> {
    try {
      if (!this.isConfigured) {
        await this.initialize(userId);
      }
      let Purchases: any = null;
      try {
        Purchases = require('react-native-purchases').default || require('react-native-purchases');
      } catch (e) {}

      if (Purchases && typeof Purchases.logIn === 'function') {
        await Purchases.logIn(userId);
      }
    } catch (e) {
      console.log('[RevenueCatService] logIn skipped:', e);
    }
  }

  static async purchaseProduct(productIdentifier: string): Promise<any> {
    try {
      let Purchases: any = null;
      try {
        Purchases = require('react-native-purchases').default || require('react-native-purchases');
      } catch (e) {}

      if (!Purchases) {
        throw new Error('In-app purchases are not available in this environment.');
      }

      let storeProduct: any = null;
      try {
        const products = await Purchases.getProducts([productIdentifier]);
        if (products && products.length > 0) {
          storeProduct = products[0];
        }
      } catch (e) {
        console.log('[RevenueCatService] getProducts error:', e);
      }

      let result: any = null;
      if (storeProduct) {
        result = await Purchases.purchaseStoreProduct(storeProduct);
      } else {
        result = await Purchases.purchaseProduct(productIdentifier, null, Purchases.PURCHASE_TYPE?.INAPP);
      }

      return result;
    } catch (e: any) {
      if (e.userCancelled) {
        console.log('[RevenueCatService] User cancelled purchase');
        return { cancelled: true };
      }
      console.error('[RevenueCatService] Purchase error:', e);
      throw e;
    }
  }

  static async logout(): Promise<void> {
    try {
      let Purchases: any = null;
      try {
        Purchases = require('react-native-purchases').default || require('react-native-purchases');
      } catch (e) {}

      if (this.isConfigured && Purchases && typeof Purchases.logOut === 'function') {
        await Purchases.logOut();
      }
    } catch (e) {
      console.log('[RevenueCatService] logOut skipped:', e);
    }
  }
}

export default RevenueCatService;
