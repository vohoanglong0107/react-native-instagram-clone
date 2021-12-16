import {useIsFocused, RouteProp} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StyleSheet, PermissionsAndroid} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  Asset,
} from 'react-native-image-picker';
import {goBack, navigate} from '../../navigations/rootNavigation';
import {SuperRootStackParamList} from '../../navigations';
import {SafeAreaView} from 'react-native-safe-area-context';

type StoryTakerRouteProp = RouteProp<SuperRootStackParamList, 'StoryTaker'>;

type StoryTakerProps = {
  route: StoryTakerRouteProp;
};

export type StoryImageSpec = {
  width: number;
  height: number;
  uri: string;
  base64: string;
  extension: string;
};
const StoryTaker = ({route}: StoryTakerProps) => {
  const {sendToDirect, username} = route?.params || {};
  const focused = useIsFocused();

  const processPhotos = async (photos: Asset[]) => {
    const images: StoryImageSpec[] = [...photos].map(photo => ({
      width: photo.width!,
      height: photo.height!,
      uri: photo.uri!,
      base64: photo.base64 || '',
      extension: photo.fileName!.split('.').pop() || 'jpg',
    }));
    navigate('StoryProcessor', {
      images,
      sendToDirect,
      username,
    });
  };

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'App Camera Permission',
            message: 'App needs access to your camera ',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const res = await launchCamera({
            mediaType: 'photo',
          });
          if (res.didCancel) {
            const res1 = await launchImageLibrary({
              mediaType: 'photo',
              selectionLimit: 0,
            });
            if (res1.didCancel) {
              goBack();
            } else {
              processPhotos(res1.assets!);
            }
          } else {
            processPhotos(res.assets!);
          }
        } else {
          goBack();
        }
      } catch (err) {
        console.warn(err);
      }
    };
    if (focused) requestCameraPermission();
    return () => {};
  }, [focused]);

  return <SafeAreaView></SafeAreaView>;
};
export default StoryTaker;

const styles = StyleSheet.create({});
