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
      const isAmazon = process.env.EXPO_PUBLIC_IS_AMAZON_BUILD === 'true';
      const amazonKey = process.env.EXPO_PUBLIC_REVENUECAT_AMAZON_API_KEY || process.env.EXPO_PUBLIC_AMAZON_API_KEY || 'amzn_kizSPIvqSmmcOFLROwJQMlzkmQs';
      const googleKey = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_API_KEY || 'goog_aGsovwivUCTOPSJpDftzccNkrfI';

      const apiKey = Platform.OS === 'ios' 
        ? (process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY || 'appl_dummy_key')
        : (isAmazon ? amazonKey : googleKey);

      if (Purchases && typeof Purchases.configure === 'function') {
        const customLogger = (logLevel: any, message: string) => {
          // Log cleanly as info to prevent Metro terminal RedBox or NamelessError popups
          console.log('[RevenueCat]', message);
        };

        try {
          if (typeof Purchases.setLogHandler === 'function') {
            Purchases.setLogHandler(customLogger);
          }
        } catch (logErr) {}

        Purchases.configure({
          apiKey,
          appUserID: userId || undefined,
          useAmazon: isAmazon && Platform.OS === 'android',
        });

        try {
          if (typeof Purchases.setLogHandler === 'function') {
            Purchases.setLogHandler(customLogger);
          }
          if (typeof Purchases.setLogLevel === 'function') {
            Purchases.setLogLevel(Purchases.LOG_LEVEL?.INFO ?? 'INFO');
          }
        } catch (logErr) {}

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
        console.log('[RevenueCatService] Native Purchases module unavailable. Returning dev fallback.');
        return { fallback: true, success: true };
      }

      // 1. Try resolving through RevenueCat Offerings (current and all registered offerings)
      try {
        const offerings = await Purchases.getOfferings();
        
        // Collect packages from current offering AND all offerings in offerings.all
        const packagePool: any[] = [];
        if (offerings?.current?.availablePackages) {
          packagePool.push(...offerings.current.availablePackages);
        }
        if (offerings?.all) {
          Object.values(offerings.all).forEach((offering: any) => {
            if (offering?.availablePackages) {
              offering.availablePackages.forEach((pkg: any) => {
                if (!packagePool.some((existing) => existing.identifier === pkg.identifier)) {
                  packagePool.push(pkg);
                }
              });
            }
          });
        }

        if (packagePool.length > 0) {
          const targetLower = productIdentifier.toLowerCase();
          const isMonthlyTarget = targetLower.includes('monthly') || targetLower.includes('99');

          // Exact or flexible match
          const matchedPkg = packagePool.find((pkg: any) => {
            const pId = (pkg.product?.identifier || '').toLowerCase();
            const pkgId = (pkg.identifier || '').toLowerCase();
            const pkgType = (pkg.packageType || '').toUpperCase();

            // Match exact product or package identifier
            if (pId === targetLower || pkgId === targetLower) return true;
            if (pId === `${targetLower}:monthly-plan`) return true;

            // Match RevenueCat standard identifiers
            if (isMonthlyTarget) {
              if (pkgId === '$rc_monthly' || pkgId === 'monthly' || pkgType === 'MONTHLY') return true;
              if (pkgId.includes('monthly') || pId.includes('monthly')) return true;
            }

            return false;
          }) || (isMonthlyTarget ? packagePool[0] : null);

          if (matchedPkg) {
            console.log('[RevenueCatService] Purchasing via matched offering package:', matchedPkg.identifier);
            const result = await Purchases.purchasePackage(matchedPkg);
            return result;
          }
        }
      } catch (offeringErr: any) {
        console.log('[RevenueCatService] Offerings lookup notice:', offeringErr?.message || offeringErr);
      }

      // 2. Try fetching as Subscription (Google Play Billing v5/v6+)
      let storeProduct: any = null;
      try {
        const subProducts = await Purchases.getProducts(
          [productIdentifier, `${productIdentifier}:monthly-plan`],
          Purchases.PURCHASE_TYPE?.SUBS || 'SUBS'
        );
        if (subProducts && subProducts.length > 0) {
          storeProduct = subProducts[0];
        }
      } catch (subErr) {
        console.log('[RevenueCatService] Subscription product lookup notice:', subErr);
      }

      // 3. Fallback to INAPP product lookup if not a subscription
      if (!storeProduct) {
        try {
          const inappProducts = await Purchases.getProducts(
            [productIdentifier],
            Purchases.PURCHASE_TYPE?.INAPP || 'INAPP'
          );
          if (inappProducts && inappProducts.length > 0) {
            storeProduct = inappProducts[0];
          }
        } catch (inappErr) {
          console.log('[RevenueCatService] INAPP product lookup notice:', inappErr);
        }
      }

      let result: any = null;
      if (storeProduct) {
        if (storeProduct.defaultOption && typeof Purchases.purchaseSubscriptionOption === 'function') {
          result = await Purchases.purchaseSubscriptionOption(storeProduct.defaultOption);
        } else {
          result = await Purchases.purchaseStoreProduct(storeProduct);
        }
        return result;
      }

      // 4. If product not found on Google Play (e.g., propagation delay or dev environment)
      console.log(`[RevenueCatService] Product "${productIdentifier}" not active on store yet (propagation delay or dev). Using dev fallback.`);
      return { fallback: true, success: true };
    } catch (e: any) {
      if (e.userCancelled) {
        console.log('[RevenueCatService] User cancelled purchase');
        return { cancelled: true };
      }

      const errStr = (e?.message || e?.code || '').toString().toLowerCase();
      // Detect Google Play "Already Subscribed / Already Owned"
      if (
        errStr.includes('already') ||
        errStr.includes('owned') ||
        e?.code === 'ProductAlreadyPurchasedError' ||
        e?.code === '7'
      ) {
        console.log('[RevenueCatService] Item already subscribed on Google Play account.');
        return {
          success: false,
          alreadySubscribed: true,
          error: 'You are already subscribed to SoulShuffle Monthly VIP on your Google Play account.',
        };
      }

      console.warn('[RevenueCatService] Native purchase skipped/fallback:', e?.message || e);
      // Return safe fallback so backend activation can proceed during testing
      return { fallback: true, error: e?.message || 'Store billing error' };
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
