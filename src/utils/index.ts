import firestore, {FirebaseFirestoreTypes} from "@react-native-firebase/firestore"
import storage from "@react-native-firebase/storage"
import { UserInfo } from "../reducers/userReducer"
import { store } from "../store"
import Share, { ShareOptions } from "react-native-share"
import { ExtraPost } from "../reducers/postReducer"
import { ProfileX } from "../reducers/profileXReducer"
import { StoryProcessedImage, StoryProcessedImageInFireStore } from "../screens/Others/StoryProcessor"

export const timestampToString = (create_at: number, suffix?: boolean): string => {
    let diffTime: string | number = (new Date().getTime() - (create_at || 0)) / 1000
    if (diffTime < 60) diffTime = 'Just now'
    else if (diffTime > 60 && diffTime < 3600) {
        diffTime = Math.floor(diffTime / 60)
            + (Math.floor(diffTime / 60) > 1 ? (suffix ? ' minutes' : 'm') : (suffix ? ' minute' : 'm')) + (suffix ? ' ago' : '')
    } else if (diffTime > 3600 && diffTime / 3600 < 24) {
        diffTime = Math.floor(diffTime / 3600)
            + (Math.floor(diffTime / 3600) > 1 ? (suffix ? ' hours' : 'h') : (suffix ? ' hour' : 'h')) + (suffix ? ' ago' : '')
    }
    else if (diffTime > 86400 && diffTime / 86400 < 30) {
        diffTime = Math.floor(diffTime / 86400)
            + (Math.floor(diffTime / 86400) > 1 ? (suffix ? ' days' : 'd') : (suffix ? ' day' : 'd')) + (suffix ? ' ago' : '')
    } else {
        diffTime = new Date(create_at || 0).toDateString()
    }
    return diffTime
}
export const convertDateToTimeStampFireBase = (date: Date): FirebaseFirestoreTypes.Timestamp => {
    return new firestore.Timestamp(Math.floor(date.getTime() / 1000), date.getTime() - Math.floor(date.getTime() / 1000) * 1000)
}
export const generateUsernameKeywords = (fullText: string): string[] => {
    const keywords: string[] = []
    const splitedText = fullText.split('')
    splitedText.map((s, index) => {
        const temp = splitedText.slice(0, index + 1).join('')
        keywords.push(temp)
    })
    return Array.from(new Set(keywords))
}
export const findUsersByName = async (q: string) => {
    let users: UserInfo[] = []
    const ref = firestore()
    const rq = await ref.collection('users').where(
        'keyword', 'array-contains', q
    ).get()
    rq.docs.map(x => {
        const user: UserInfo = x.data()
        users.push(user)
    })
    users = users.filter(u => u.username !== store.getState().user.user.userInfo?.username)
    return users
}

export const sharePost = (post: ExtraPost) => {
    const options: ShareOptions = {
        activityItemSources: [
            { // For sharing url with custom title.
                placeholderItem: {
                    type: 'url',
                    content: 'https://www.facebook.com/photo.php?fbid=619895371910790'
                },
                item: {
                    default: { type: 'url', content: 'https://www.facebook.com/photo.php?fbid=619895371910790' },
                },
                subject: {
                    default: post.content || '',
                },
                linkMetadata: {
                    originalUrl: 'https://www.facebook.com/photo.php?fbid=619895371910790',
                    url: 'https://www.facebook.com/photo.php?fbid=619895371910790',
                    // title: post.content
                },
            },
            { // For sharing text.
                placeholderItem: { type: 'text', content: post.content || "" },
                item: {
                    default: { type: 'text', content: 'Hello....' },
                    message: null, // Specify no text to share via Messages app.
                },
                linkMetadata: { // For showing app icon on share preview.
                    title: `https://img.favpng.com/9/25/24/computer-icons-instagram-logo-sticker-png-favpng-LZmXr3KPyVbr8LkxNML458QV3.jpg`
                },
            },
            { // For using custom icon instead of default text icon at share preview when sharing with message.
                placeholderItem: {
                    type: 'url',
                    content: 'a'
                },
                item: {
                    default: {
                        type: 'text',
                        content: `${post.ownUser?.username} has been posted a image`
                    },
                },
                linkMetadata: {
                    title: `${post.ownUser?.username} has been posted a image`,
                    icon: `https://img.favpng.com/9/25/24/computer-icons-instagram-logo-sticker-png-favpng-LZmXr3KPyVbr8LkxNML458QV3.jpg`
                }
            },
        ],
    }
    Share.open(options)
}
export const shareProfile = (user: ProfileX) => {
    const options: ShareOptions = {
        activityItemSources: [
            { // For sharing url with custom title.
                placeholderItem: {
                    type: 'url',
                    content: user.avatarURL || ''
                },
                item: {
                    default: { type: 'url', content: user.avatarURL || '' },
                },
                subject: {
                    default: user.username || '',
                },
                linkMetadata: {
                    originalUrl: user.avatarURL || '',
                    url: user.avatarURL || '',
                    // title: post.content
                },
            },
            { // For sharing text.
                placeholderItem: { type: 'text', content: user.username || "" },
                item: {
                    default: { type: 'text', content: `${user.username} on Instagram` },
                    message: null, // Specify no text to share via Messages app.
                },
                linkMetadata: { // For showing app icon on share preview.
                    title: `https://img.favpng.com/9/25/24/computer-icons-instagram-logo-sticker-png-favpng-LZmXr3KPyVbr8LkxNML458QV3.jpg`
                },
            },
            { // For using custom icon instead of default text icon at share preview when sharing with message.
                placeholderItem: {
                    type: 'url',
                    content: user.avatarURL || ''
                },
                item: {
                    default: {
                        type: 'text',
                        content: `${user.username} on Instagram`
                    },
                },
                linkMetadata: {
                    title: `${user.username} on Instagram`,
                    icon: user.avatarURL
                }
            },
        ],
    }
    Share.open(options)
}
export const Timestamp = () => {
    const curDate = new Date()
    const second = Math.floor(curDate.getTime() / 1000)
    const nanosecond = curDate.getTime() - second * 1000
    return new firestore.Timestamp(second, nanosecond)
}
export const convertToFirebaseDatabasePathName = (text: string) => {
    return text.replace(/\./g, "!").replace(/#/g, "@")
        .replace(/\$/g, "%").replace(/\[/g, "&")
        .replace(/\]/g, "*")
}
export const revertFirebaseDatabasePathName = (text: string) => {
    return text.replace(/\!/g, ".").replace(/\@/g, "#")
        .replace(/\%/g, "$").replace(/\&/g, "[")
        .replace(/\*/g, "]")
}

export const uploadSuperImages = (images: StoryProcessedImageInFireStore[]): Promise<{
    sourceId: number,
    hashtags: string[],
    mention: string[],
}>[] => {
    const ref = firestore()
    const myUsername = store.getState().user.user.userInfo?.username || ''
    return images.map(async (img, index) => {
        let uid = new Date().getTime() + index
        let storagePath = `story/${myUsername || 'others'}/${new Date().getTime() + Math.random()}.${img.extension.toLowerCase()}`
        const rq = await storage()
            .ref(storagePath)
            .putFile(img.uri)
        const downloadUri = await storage().ref(storagePath).getDownloadURL();
        ref.collection('superimages').doc(`${uid}`).set({
            ...img,
            uri: downloadUri,
            uid,
            userId: myUsername
        })
        return {
            sourceId: uid,
            hashtags: Array.from(new Set(img.labels
                .filter(x => x.type === 'hashtag').map(x => x.text))),
            mention: Array.from(new Set(img.labels
                .filter(x => x.type === 'people').map(x => x.text.slice(1)))),
        }
    })
}
export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}