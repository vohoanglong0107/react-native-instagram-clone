import {RouteProp} from '@react-navigation/native';
import storage from '@react-native-firebase/storage';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch} from 'react-redux';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  AddEmoijToMessageRequest,
  CreateEmptyConversationRequest,
  CreateMessageRequest,
  MakeSeenRequest,
  RemoveEmoijToMessageRequest,
} from '../../../actions/messageActions';
import MessageItem from '../../../components/MessageItem';
import {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  STATUS_BAR_HEIGHT,
} from '../../../constants';
import {SuperRootStackParamList} from '../../../navigations';
import {goBack, navigate} from '../../../navigations/rootNavigation';
import {useSelector} from '../../../reducers';
import {
  emojiTypes,
  messagesTypes,
  onlineTypes,
  PostingMessage,
  seenTypes,
} from '../../../reducers/messageReducer';
import {store} from '../../../store';
import {timestampToString} from '../../../utils';
type ConversationRouteProp = RouteProp<SuperRootStackParamList, 'Conversation'>;
type ConversationProps = {
  route: ConversationRouteProp;
};
const Conversation = ({route}: ConversationProps) => {
  const dispatch = useDispatch();
  const myUsername = store.getState().user.user.userInfo?.username || '';
  const targetUsername = route.params.username;
  const myCurrentBlockAccounts =
    useSelector(
      state => state.user.setting?.privacy?.blockedAccounts?.blockedAccounts,
    ) || [];
  const conversation = useSelector(
    state =>
      state.messages.filter(
        group => group.ownUser.username === targetUsername,
      )[0],
  );
  const [typing, setTyping] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const _flatlistRef = useRef<FlatList>(null);
  const _emojiBarAnimX = React.useMemo(() => new Animated.Value(0), []);
  const _emojiBarAnimY = React.useMemo(() => new Animated.Value(0), []);
  const _emojiBarAnimRatio = React.useMemo(() => new Animated.Value(0), []);
  const _emojiPointAnimOffsetX = React.useMemo(() => new Animated.Value(0), []);
  const _emojiPointAnimOpacity = React.useMemo(() => new Animated.Value(0), []);
  const [selectedEmoijTargetIndex, setSelectedEmoijTargetIndex] =
    useState<number>(-1);
  const ref = useRef<{
    scrollTimeOut: NodeJS.Timeout;
    text: string;
    preventNextScrollToEnd: boolean;
  }>({
    scrollTimeOut: setTimeout(() => {}, 0),
    text: '',
    preventNextScrollToEnd: false,
  });

  useEffect(() => {
    if (!!!conversation) {
      dispatch(CreateEmptyConversationRequest(targetUsername));
      return;
    }
    if (conversation.messageList.length > 0) {
      const myUsername = store.getState().user.user.userInfo?.username || '';
      const isMyMessage = conversation.messageList[0].userId === myUsername;
      const unRead =
        !isMyMessage && conversation.messageList[0].seen === seenTypes.NOTSEEN;
      if (unRead) {
        dispatch(
          MakeSeenRequest(
            conversation.messageList[0].userId,
            conversation.messageList[0].uid,
          ),
        );
      }
    }
  }, [conversation]);

  const _onSendText = () => {
    if (text.length > 0) {
      const msg: PostingMessage = {
        seen: 0,
        type: 1,
        text,
        create_at: new Date().getTime(),
      };
      dispatch(CreateMessageRequest(msg, targetUsername));
      setText('');
    }
  };

  const _onMsgInputFocus = () => {
    setTyping(true);
  };
  const _onUploadImage = async (type: 'photo' | 'camera') => {
    let res;
    if (type === 'photo') {
      res = await launchImageLibrary({
        mediaType: 'photo',
      });
    } else {
      res = await launchCamera({
        mediaType: 'photo',
      });
    }
    if (!res.didCancel) {
      const timestamp = new Date().getTime();
      res.assets!.forEach(async (photo, index) => {
        const extension = photo.fileName!.split('.').pop()?.toLocaleLowerCase();
        let storagePath = `messages/${myUsername}/${
          new Date().getTime() + Math.random()
        }.${extension}`;
        const rq = await storage().ref(storagePath).putFile(photo.uri!);
        const downloadUri = await storage().ref(storagePath).getDownloadURL();
        const message: PostingMessage = {
          uid: timestamp + index,
          create_at: timestamp,
          type: messagesTypes.IMAGE,
          sourceUri: downloadUri,
          seen: 0,
          width: photo.width,
          height: photo.height,
        };
        dispatch(CreateMessageRequest(message, targetUsername));
      });
    }
  };
  const _onShowEmojiSelection = React.useCallback(
    (px: number, py: number, index: number) => {
      setSelectedEmoijTargetIndex(index);
      _emojiBarAnimY.setValue(py - 50);
      if (px > SCREEN_WIDTH / 2) {
        _emojiBarAnimX.setValue(SCREEN_WIDTH - 15 - EMOJI_SELECTION_BAR_WIDTH);
      } else _emojiBarAnimX.setValue(15);
      //show selected emoji
      const targetMsg = conversation.messageList[index];
      const isMyMessage = targetMsg.userId === myUsername;
      if (targetMsg.ownEmoji && isMyMessage) {
        _emojiPointAnimOffsetX.setValue(
          7.5 + (targetMsg.ownEmoji - 1) * 44 + 22 - 1.5,
        );
      }
      if (targetMsg.yourEmoji && !isMyMessage) {
        _emojiPointAnimOffsetX.setValue(
          7.5 + (targetMsg.yourEmoji - 1) * 44 + 22 - 1.5,
        );
      }
      if (
        !(targetMsg.ownEmoji && isMyMessage) &&
        !(targetMsg.yourEmoji && !isMyMessage)
      )
        _emojiPointAnimOpacity.setValue(0);
      else _emojiPointAnimOpacity.setValue(1);
      //end show selected emoji
      Animated.spring(_emojiBarAnimRatio, {
        useNativeDriver: true,
        toValue: 1,
      }).start();
    },
    [conversation?.messageList],
  );
  const _onHideEmojiSelection = () => {
    Animated.timing(_emojiBarAnimRatio, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedEmoijTargetIndex(-1));
  };
  const _onEmojiSelect = (
    emojiType: 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY' | 'LIKE',
  ) => {
    ref.current.preventNextScrollToEnd = true;
    _onHideEmojiSelection();
    const emoji = emojiTypes[emojiType];
    const targetMsg = conversation.messageList[selectedEmoijTargetIndex];
    const isMyMessage = targetMsg.userId === myUsername;
    if (
      (targetMsg.ownEmoji === emoji && isMyMessage) ||
      (targetMsg.yourEmoji === emoji && !isMyMessage)
    ) {
      return dispatch(
        RemoveEmoijToMessageRequest(targetUsername, targetMsg.uid),
      );
    }
    dispatch(AddEmoijToMessageRequest(targetUsername, targetMsg.uid, emoji));
  };
  const _onMessageBoxSizeChange = () => {
    if (
      conversation.messageList.length > 0 &&
      !ref.current.preventNextScrollToEnd
    ) {
      clearTimeout(ref.current.scrollTimeOut);
      ref.current.scrollTimeOut = setTimeout(() => {
        _flatlistRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        });
      }, 1000);
    }
    if (ref.current.preventNextScrollToEnd) {
      ref.current.preventNextScrollToEnd = false;
    }
  };
  const checkOnline = () => {
    return (
      conversation &&
      conversation.online &&
      conversation.online.status === onlineTypes.ACTIVE &&
      conversation.online.last_online > new Date().getTime() - 1000 * 60 * 5
    );
  };

  if (!!!conversation)
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
        }}></View>
    );
  const isBlocked =
    myCurrentBlockAccounts.indexOf(targetUsername) > -1 ||
    (conversation.ownUser.privacySetting?.blockedAccounts?.blockedAccounts &&
      conversation.ownUser.privacySetting?.blockedAccounts?.blockedAccounts.indexOf(
        myUsername,
      ) > -1);
  return (
    <View style={styles.container}>
      {selectedEmoijTargetIndex > -1 && (
        <TouchableOpacity
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            position: 'absolute',
            zIndex: 10,
            top: 0,
            left: 0,
          }}
          onPress={_onHideEmojiSelection}
          activeOpacity={1}>
          <Animated.View
            style={{
              ...styles.emojiSelectionBar,
              transform: [
                {
                  translateY: _emojiBarAnimY,
                },
                {
                  translateX: _emojiBarAnimX,
                },
                {
                  scale: _emojiBarAnimRatio,
                },
              ],
            }}>
            {
              <Animated.View
                style={{
                  ...styles.selectedEmojiPoint,
                  opacity: _emojiPointAnimOpacity,
                  transform: [
                    {
                      translateX: _emojiPointAnimOffsetX,
                    },
                  ],
                }}
              />
            }
            <TouchableOpacity
              onPress={_onEmojiSelect.bind(null, 'LOVE')}
              style={styles.btnEmoji}>
              <Text style={styles.emoji}>❤️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={_onEmojiSelect.bind(null, 'HAHA')}
              style={styles.btnEmoji}>
              <Text style={styles.emoji}>😂</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={_onEmojiSelect.bind(null, 'WOW')}
              style={styles.btnEmoji}>
              <Text style={styles.emoji}>😮</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={_onEmojiSelect.bind(null, 'SAD')}
              style={styles.btnEmoji}>
              <Text style={styles.emoji}>😢</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={_onEmojiSelect.bind(null, 'ANGRY')}
              style={styles.btnEmoji}>
              <Text style={styles.emoji}>😡</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={_onEmojiSelect.bind(null, 'LIKE')}
              style={styles.btnEmoji}>
              <Text style={styles.emoji}>👍</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}
      <View style={styles.navigationBar}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TouchableOpacity onPress={goBack} style={styles.btnNavigation}>
            <Icon name="arrow-left" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigate('ProfileX', {
                username: conversation.ownUser.username,
              })
            }
            style={styles.userInfo}>
            <View style={styles.targetUserAvatarWrapper}>
              <FastImage
                style={styles.targetUserAvatar}
                source={{
                  uri: conversation.ownUser.avatarURL,
                }}
              />
              {checkOnline() && <View style={styles.onlinePoint} />}
            </View>
            <View
              style={{
                marginLeft: 10,
              }}>
              <Text
                style={{
                  fontWeight: '600',
                }}>
                {conversation.ownUser.fullname}
              </Text>
              {checkOnline() ? (
                <Text style={styles.onlineText}>Active now</Text>
              ) : (
                conversation &&
                conversation.online && (
                  <Text style={styles.onlineText}>
                    Active {timestampToString(conversation.online.last_online)}{' '}
                    ago
                  </Text>
                )
              )}
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.rightOptions}>
          <TouchableOpacity style={styles.btnNavigation}>
            <Image
              style={{
                height: 24,
                width: 24,
              }}
              source={require('../../../assets/icons/video-call.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigate('ConversationOptions', {
                username: targetUsername,
              })
            }
            style={styles.btnNavigation}>
            <Image
              style={{
                height: 24,
                width: 24,
              }}
              source={require('../../../assets/icons/info.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      <KeyboardAvoidingView behavior="height" style={styles.messagesContainer}>
        <Animated.View
          style={{
            ...styles.inboxContainer,
            height: '100%',
          }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            ref={_flatlistRef}
            onLayout={_onMessageBoxSizeChange}
            style={{
              height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 88 - 30,
            }}
            data={conversation.messageList || []}
            renderItem={({item, index}) => (
              <MessageItem
                {...{
                  item,
                  index,
                  owner: conversation.ownUser,
                  showMsgEmojiSelection: _onShowEmojiSelection,
                }}
              />
            )}
            keyExtractor={(__, index) => `${index}`}
            inverted
          />
          <View style={styles.msgInputWrapper}>
            {!isBlocked && (
              <React.Fragment>
                <TouchableOpacity
                  onPress={_onUploadImage}
                  activeOpacity={0.8}
                  style={styles.btnCamera}>
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                    }}
                    source={require('../../../assets/icons/camera-white.png')}
                  />
                </TouchableOpacity>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  multiline={true}
                  onFocus={_onMsgInputFocus}
                  onBlur={setTyping.bind(null, false)}
                  style={{
                    ...styles.msgInput,
                    width:
                      typing || text.length > 0
                        ? SCREEN_WIDTH - 30 - 44 - 60
                        : SCREEN_WIDTH - 30 - 44,
                  }}
                  placeholder="Message..."
                />
                {typing || text.length > 0 ? (
                  <TouchableOpacity
                    onPress={_onSendText}
                    style={styles.btnSend}>
                    <Text
                      style={{
                        fontWeight: '600',
                        color: '#318bfb',
                      }}>
                      Send
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    {text.length === 0 && (
                      <View style={styles.msgRightOptions}>
                        <TouchableOpacity
                          onPress={_onUploadImage}
                          style={styles.btnNavigation}>
                          <Image
                            style={{
                              width: 20,
                              height: 20,
                            }}
                            source={require('../../../assets/icons/photo.png')}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigate('EmojiOptions', {
                              targetUsername,
                            });
                          }}
                          style={styles.btnNavigation}>
                          <Image
                            style={{
                              width: 20,
                              height: 20,
                            }}
                            source={require('../../../assets/icons/emoji.png')}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </React.Fragment>
            )}
            {isBlocked && (
              <Text
                style={{
                  textAlign: 'center',
                  width: '100%',
                  color: '#666',
                }}>
                You can't not reply this conversation.
              </Text>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Conversation;
const EMOJI_SELECTION_BAR_WIDTH = 44 * 6 + 15;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  emojiSelectionBar: {
    position: 'absolute',
    zIndex: 999,
    backgroundColor: '#fff',
    top: 0,
    left: 0,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    borderRadius: 44,
    paddingHorizontal: 7.5,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  btnEmoji: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 30,
  },
  selectedEmojiPoint: {
    height: 3,
    width: 3,
    borderRadius: 3,
    backgroundColor: '#666',
    position: 'absolute',
    bottom: 2,
  },
  navigationBar: {
    height: 44 + STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2.5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 5,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    zIndex: 1,
  },
  rightOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  btnNavigation: {
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetUserAvatarWrapper: {},
  onlinePoint: {
    position: 'absolute',
    backgroundColor: '#79d70f',
    height: 15,
    width: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    bottom: -2,
    right: -2,
  },
  onlineText: {
    fontSize: 12,
    color: '#666',
  },
  targetUserAvatar: {
    width: 30,
    height: 30,
    borderRadius: 30,
    borderColor: '#333',
    borderWidth: 0.3,
  },
  messagesContainer: {
    backgroundColor: '#fff',
    width: '100%',
    height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44,
    paddingBottom: 20,
  },
  uploadingImageMask: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingNotification: {
    backgroundColor: '#fff',
    padding: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    borderRadius: 5,
  },
  btnUploadImage: {
    position: 'absolute',
    height: 50,
    width: 50,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 50,
    left: (SCREEN_WIDTH - 50) / 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageItem: {
    width: (SCREEN_WIDTH - 5) / 3,
    height: (SCREEN_WIDTH - 5) / 3,
    marginVertical: 1.25,
    backgroundColor: 'red',
  },
  inboxContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: -1,
    bottom: 20,
    left: 0,
  },
  msgInputWrapper: {
    marginTop: 10,
    width: SCREEN_WIDTH - 30,
    marginHorizontal: 15,
    minHeight: 44,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnCamera: {
    height: 34,
    width: 34,
    margin: 4,
    borderRadius: 34,
    backgroundColor: '#318bfb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgInput: {
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  btnSend: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
  },
  msgRightOptions: {
    flexDirection: 'row',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    bottom: 0,
    marginRight: 4,
  },
});
