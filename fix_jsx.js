const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const badStr = `              </View>
                  </View>
                  <TouchableOpacity className="bg-[#3b1723] px-4 py-2.5 rounded-full flex-row items-center ml-2">
                    <Text className="text-white font-bold text-[12px] mr-1.5">Continue</Text>
                    <Ionicons name="arrow-forward" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              )}`;

const goodStr = `              </View>
              )}`;

code = code.replace(badStr, goodStr);
fs.writeFileSync('app/(tabs)/index.tsx', code);
console.log('Fixed trailing JSX!');
