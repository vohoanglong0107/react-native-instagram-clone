import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch} from 'react-redux';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from '../../../constants';
import {SuperRootStackParamList} from '../../../navigations';
import {goBack} from '../../../navigations/rootNavigation';
import Switcher from '../../../components/Switcher';
import {Timestamp} from '../../../utils';
import {Post, PostImage} from '../../../reducers/postReducer';
import storage from '@react-native-firebase/storage';
import {store} from '../../../store';
import {CreatePostRequest} from '../../../actions/postActions';
import {launchImageLibrary} from 'react-native-image-picker';
type GalleryChooserRouteProp = RouteProp<
  SuperRootStackParamList,
  'GalleryChooser'
>;

type GalleryChooserNavigationProp = StackNavigationProp<
  SuperRootStackParamList,
  'GalleryChooser'
>;

type GalleryChooserProps = {
  navigation: GalleryChooserNavigationProp;
  route: GalleryChooserRouteProp;
};
export type ProcessedImage = {
  uri: string;
  width: number;
  height: number;
  extension: string;
  tags: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    showBtnDelete: boolean;
    animX: Animated.Value;
    animY: Animated.Value;
    username: string;
  }[];
};
const GalleryChooser = ({navigation, route}: GalleryChooserProps) => {
  const user = store.getState().user.user.userInfo;
  const dispatch = useDispatch();
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);

  const [showAdvancedSettings, setShowAdvancedSettings] =
    useState<boolean>(false);
  const [offComment, setOffComment] = useState<boolean>(false);
  const [altText, setAltText] = useState<string>('');
  const [writeAltText, setWriteAltText] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>('');
  const _postToolScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    async function getPhotos() {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0,
      });
      if (res.didCancel) {
        goBack();
      } else {
        const tasks: ProcessedImage[] = res.assets!.map(photo => {
          const extension = photo
            .fileName!.split('.')
            .pop()
            ?.toLocaleLowerCase();
          return {
            uri: photo.uri!,
            tags: [],
            extension: extension as string,
            width: photo.width!,
            height: photo.height!,
          };
        });
        setProcessedImages([...tasks]);
      }
    }
    getPhotos();
    return () => {};
  }, []);

  const _onDone = async () => {
    const imageList = [...processedImages];
    const tasks: Promise<PostImage>[] = imageList.map(async img => {
      let storagePath = `posts/${user?.username || 'others'}/${
        new Date().getTime() + Math.random()
      }.${img.extension}`;
      const rq = await storage().ref(storagePath).putFile(img.uri);
      const downloadUri = await storage().ref(storagePath).getDownloadURL();
      return {
        uri: downloadUri,
        width: img.width,
        height: img.height,
        extension: img.extension,
        tags: img.tags.map(tag => ({
          x: tag.x,
          y: tag.y,
          width: tag?.width || 0,
          height: tag?.height || 0,
          username: tag.username,
        })),
      };
    });
    Promise.all(tasks).then(async resultList => {
      let tagUsername: string[] = [];
      resultList.map(img => {
        img.tags.map(tag => tagUsername.push(tag.username));
      });
      const regex = /@[a-zA-Z0-9._]{4,}/g;
      let m;
      while ((m = regex.exec(caption)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        m.forEach((match, groupIndex) => {
          tagUsername.push(match.slice(1));
        });
      }
      tagUsername = Array.from(new Set(tagUsername));
      const postData: Post = {
        altText,
        content: caption,
        create_at: Timestamp(),
        isVideo: false,
        permission: 1,
        notificationUsers: offComment
          ? []
          : user?.username
          ? [user.username]
          : [],
        likes: [],
        tagUsername,
        source: resultList,
        userId: user?.username,
      };
      dispatch(CreatePostRequest(postData));
      goBack();
    });
  };

  const _onTagPeople = () => {
    // FIXME: remove _onTagChange and move to TagPeople params on navigate back
    navigation.navigate('TagPeople', {
      images: [...processedImages],
      onDone: _onTagChange,
    });
  };
  const _onTagChange = React.useCallback((images: ProcessedImage[]) => {
    setProcessedImages(images);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      {writeAltText && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={setWriteAltText.bind(null, false)}
          style={{
            zIndex: 999,
            position: 'absolute',
            left: 0,
            top: 0,
            height: SCREEN_HEIGHT,
            width: SCREEN_WIDTH,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              width: '80%',
            }}>
            <View
              style={{
                height: 44,
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomColor: '#ddd',
                borderBottomWidth: 1,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                }}>
                Write Alt Text
              </Text>
            </View>
            <TextInput
              placeholder="Write alt text"
              multiline={true}
              style={{
                padding: 10,
                minHeight: 100,
                borderBottomColor: '#ddd',
                borderBottomWidth: 1,
              }}
              value={altText}
              onChangeText={setAltText}
            />
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                onPress={setWriteAltText.bind(null, false)}
                style={{
                  ...styles.centerBtn,
                  width: '50%',
                }}>
                <Text
                  style={{
                    fontWeight: '500',
                    color: '#999',
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={setWriteAltText.bind(null, false)}
                style={{
                  ...styles.centerBtn,
                  width: '50%',
                }}>
                <Text
                  style={{
                    fontWeight: '500',
                    color: '#318bfb',
                  }}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
      <View
        style={{
          ...styles.navigationBar,
          borderBottomColor: '#ddd',
          borderBottomWidth: 1,
        }}>
        <TouchableOpacity
          onPress={_onDone}
          style={{
            ...styles.centerBtn,
            width: 60,
          }}>
          {/* TODO: fix position */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#318bfb',
            }}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={_postToolScrollRef}
        style={{
          height: '100%',
        }}
        keyboardShouldPersistTaps="never"
        bounces={true}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
          }}>
          {processedImages.length > 0 && (
            <TouchableOpacity
              onPress={goBack}
              style={{
                height: 50,
                width: 50,
              }}>
              {processedImages.length > 1 && (
                <View
                  style={{
                    position: 'absolute',
                    zIndex: 1,
                    top: 5,
                    right: 5,
                  }}>
                  <Icon name="layers-outline" color="#fff" size={20} />
                </View>
              )}
              <Image
                style={{
                  width: '100%',
                  height: '100%',
                }}
                source={{uri: processedImages[0].uri}}
              />
            </TouchableOpacity>
          )}
          <TextInput
            value={caption}
            onChangeText={setCaption}
            multiline={true}
            style={{
              maxWidth: SCREEN_WIDTH - 30 - 50,
              paddingLeft: 10,
            }}
            placeholder="Write a caption"
          />
        </View>
        <View
          style={{
            backgroundColor: '#000',
          }}>
          <TouchableOpacity
            onPress={_onTagPeople}
            activeOpacity={0.9}
            style={styles.postOptionItem}>
            <Text
              style={{
                fontSize: 16,
              }}>
              Tag People
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={setShowAdvancedSettings.bind(null, !showAdvancedSettings)}
            activeOpacity={1}
            style={{
              ...styles.postOptionItem,
              borderWidth: 0,
            }}>
            <Text
              style={{
                color: '#666',
                fontWeight: '600',
                fontSize: 14,
              }}>
              Advanced Settings
            </Text>
          </TouchableOpacity>
        </View>
        {showAdvancedSettings && (
          <>
            <View style={styles.settingWrapper}>
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 16,
                }}>
                Comments
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginVertical: 15,
                }}>
                <Text
                  style={{
                    fontSize: 16,
                  }}>
                  Turn Off Commenting
                </Text>
                <Switcher
                  on={offComment}
                  onTurnOff={setOffComment.bind(null, false)}
                  onTurnOn={setOffComment.bind(null, true)}
                />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: '#666',
                }}>
                You can change this later by going to option menu at the top of
                your post.
              </Text>
            </View>
            <View style={styles.settingWrapper}>
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 16,
                }}>
                Accessibility
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginVertical: 15,
                }}>
                <TouchableOpacity
                  onPress={setWriteAltText.bind(null, !writeAltText)}>
                  <Text
                    style={{
                      fontSize: 16,
                    }}>
                    Write Alt Text
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: '#666',
                }}>
                Alt text describes your photos for people with visual
                impairments. Alt text will be automatically reated for your
                photos or your can choose to write your own.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GalleryChooser;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
  },
  navigationBar: {
    zIndex: 1,
    backgroundColor: '#fff',
    height: 44,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerBtn: {
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupOptionsWrapper: {
    zIndex: 10,
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#fff',
    width: '100%',
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 0.5,
  },
  uploadingContainer: {
    zIndex: 1,
    width: '80%',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  postToolWrapper: {
    zIndex: 10,
    position: 'absolute',
    bottom: 15,
    left: 0,
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnPostTool: {
    height: 40,
    width: 40,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postOptionItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    minHeight: 44,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ddd',
    paddingHorizontal: 15,
  },
  settingWrapper: {
    padding: 15,
  },
});
