const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
const lines = code.split('\n');

const startIdx = 1742;
const endIdx = 2015;

const newModal = `        <Modal
          visible={!!selectedReceivedCard}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            if (selectedReceivedCard) setDismissedCardIds((prev) => [...prev, selectedReceivedCard.id]);
            setSelectedReceivedCard(null);
            setShowDeflectDropdown(false);
          }}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" }}>
            <View style={{ width: '88%', backgroundColor: '#130508', borderRadius: 32, padding: 16, borderColor: '#3a131a', borderWidth: 1 }}>
              
              {/* Image Section */}
              {selectedReceivedCard?.card?.image_url && (
                <View style={{ width: '100%', height: 180, borderRadius: 24, overflow: 'hidden', marginBottom: 16 }}>
                  <Image source={{ uri: selectedReceivedCard.card.image_url }} style={{ width: '100%', height: '100%' }} />
                  
                  {/* Badge */}
                  <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="mail-unread" size={12} color="#ff2d55" />
                    <Text style={{ color: '#ff2d55', fontSize: 10, fontWeight: '900', marginLeft: 4, letterSpacing: 0.5 }}>NEW DARE</Text>
                  </View>

                  {/* Close X */}
                  <TouchableOpacity 
                    style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => {
                      if (selectedReceivedCard) setDismissedCardIds((prev) => [...prev, selectedReceivedCard.id]);
                      setSelectedReceivedCard(null);
                    }}
                  >
                    <Ionicons name="close" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Text Info */}
              <View style={{ paddingHorizontal: 4 }}>
                <Text style={{ color: '#ff2d55', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>
                  {selectedReceivedCard?.card?.category || 'GENERAL'}
                </Text>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                  {selectedReceivedCard?.card?.title || 'Unknown Dare'}
                </Text>
                <Text style={{ color: '#A09CA3', fontSize: 14, lineHeight: 20, marginBottom: 20 }}>
                  {selectedReceivedCard?.card?.description || 'No description provided.'}
                </Text>

                {/* Timer Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1d090d', borderRadius: 16, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#331219' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="time-outline" size={18} color="#a19ca3" />
                    <Text style={{ color: '#a19ca3', fontSize: 13, fontWeight: '600', marginLeft: 6 }}>Time left to decide</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#361118', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Ionicons name="timer-outline" size={14} color="#ff2d55" />
                    {getTargetDateStr(selectedReceivedCard) ? (
                      <CountdownTimer targetDate={getTargetDateStr(selectedReceivedCard)} style={{ color: '#ff2d55', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }} />
                    ) : (
                      <Text style={{ color: '#ff2d55', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>23h 59m</Text>
                    )}
                  </View>
                </View>

                {/* Actions */}
                <TouchableOpacity 
                  style={{ backgroundColor: '#de3355', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}
                  onPress={() => selectedReceivedCard && handleAcceptCard(selectedReceivedCard.id)}
                >
                  <Ionicons name="paper-plane-outline" size={18} color="white" style={{ position: 'absolute', left: 16 }} />
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Accept Challenge</Text>
                  <Ionicons name="chevron-forward" size={18} color="white" style={{ position: 'absolute', right: 16 }} />
                </TouchableOpacity>

                {/* Deflect (Only 30_DAYS) */}
                {activeRoom?.expiry_type === "30_DAYS" && (
                  <TouchableOpacity 
                    style={{ backgroundColor: '#210d11', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#3d1620' }}
                    onPress={() => {
                      if (deflectCardsCount > 0) {
                        setShowDeflectDropdown(!showDeflectDropdown);
                      } else {
                        Alert.alert("No Deflect Cards", "You do not have any deflect cards available.");
                      }
                    }}
                  >
                    <Ionicons name="return-up-back" size={18} color="#ff8fab" style={{ position: 'absolute', left: 16 }} />
                    <Text style={{ color: '#ff8fab', fontSize: 14, fontWeight: 'bold' }}>Deflect Card ({deflectCardsCount} left)</Text>
                    <Ionicons name="chevron-down" size={18} color="#ff8fab" style={{ position: 'absolute', right: 16 }} />
                  </TouchableOpacity>
                )}

                {/* Deflect Dropdown (if toggled) */}
                {showDeflectDropdown && activeRoom?.expiry_type === "30_DAYS" && deflectCards.length > 0 && (
                  <View style={{ backgroundColor: '#2a1217', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#4a1b26' }}>
                    <Text style={{ color: '#ff8fab', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>SELECT A CARD TO SEND BACK</Text>
                    {deflectCards.map((dc: any) => (
                      <TouchableOpacity
                        key={dc.id}
                        style={{ backgroundColor: '#3d1a22', borderRadius: 12, padding: 12, marginBottom: 8 }}
                        onPress={() => {
                          if (selectedReceivedCard) handleDeflectCard(selectedReceivedCard.id, activeRoom.id, dc.id);
                        }}
                      >
                        <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>{dc.card?.name || 'Power Card'}</Text>
                        <Text style={{ color: '#ffb3c6', fontSize: 11, marginTop: 4 }}>{dc.card?.power_description}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Reject */}
                <TouchableOpacity 
                  style={{ backgroundColor: '#1d090d', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#331219' }}
                  onPress={() => selectedReceivedCard && handleRejectCard(selectedReceivedCard.id, selectedReceivedCard.room_id || activeRoom?.id || "")}
                >
                  <Ionicons name="ban-outline" size={18} color="#ffb3c6" style={{ position: 'absolute', left: 16 }} />
                  <Text style={{ color: '#ffb3c6', fontSize: 14, fontWeight: 'bold' }}>Reject (Penalty: 1 Card)</Text>
                  <Ionicons name="chevron-forward" size={18} color="#ffb3c6" style={{ position: 'absolute', right: 16 }} />
                </TouchableOpacity>

                {/* Decide Later */}
                <TouchableOpacity 
                  style={{ alignItems: 'center', paddingVertical: 8 }}
                  onPress={() => {
                    if (selectedReceivedCard) setDismissedCardIds((prev) => [...prev, selectedReceivedCard.id]);
                    setSelectedReceivedCard(null);
                  }}
                >
                  <Text style={{ color: '#88848a', fontSize: 12, fontWeight: '600' }}>Decide Later &gt;</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>`;

lines.splice(startIdx, endIdx - startIdx + 1, newModal);
fs.writeFileSync('app/(tabs)/index.tsx', lines.join('\n'));
console.log('Fixed incoming card modal!');
