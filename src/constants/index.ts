// import firestore from '@react-native-firebase/firestore'
import { Dimensions } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import SettingComponents from '../screens/Home/Account/Setting';
export const APP_NAME = 'Instagram'
export const DEFAULT_PHOTO_URI = 'https://www.pavilionweb.com/wp-content/uploads/2017/03/man-300x300.png'
export const STATUS_BAR_HEIGHT: number = getStatusBarHeight()
export const SCREEN_HEIGHT: number = Math.round(Dimensions.get('window').height)
export const SCREEN_WIDTH: number = Math.round(Dimensions.get('window').width)
export type SettingNavigation = {
    icon?: string,
    name: string,
    component: (props?: any) => JSX.Element,
    navigationName: string,
    child?: SettingNavigation[]
}
export const settingNavigationMap: SettingNavigation[] = [
    {
        icon: 'account-plus-outline',
        name: 'Follow and Invite Friends',
        navigationName: 'FollowFriendSetting',
        component: SettingComponents.FollowFriends,
        child: [
            {
                icon: 'account-plus-outline',
                name: 'Follow Contacts',
                component: SettingComponents.FollowContacts,
                navigationName: 'FollowContact',
            },
            {
                icon: 'email-outline',
                name: 'Invite Friends by Email',
                component: SettingComponents.InviteByEmail,
                navigationName: 'InviteByEmail',
            },
            {
                icon: 'comment-outline',
                name: 'Invite Friends by SMS',
                component: SettingComponents.InviteBySMS,
                navigationName: 'InviteBySMS',
            },
            {
                icon: 'share-outline',
                name: 'Invite Friends by...',
                component: SettingComponents.InviteByOther,
                navigationName: 'InviteByOther',
            }
        ]
    },
    {
        icon: 'bell-outline',
        name: 'Notifications',
        navigationName: 'NotificationsSetting',
        component: SettingComponents.Notifications,
        child: [
            {
                name: 'Posts, Stories and Comments',
                component: SettingComponents.PostStoryComment,
                navigationName: 'PostStoryComment',
            }, {
                name: 'Following and Followers',
                component: SettingComponents.FollowingFollower,
                navigationName: 'FollowingFollower',
            }, {
                name: 'Direct Messages',
                component: SettingComponents.DirectMessages,
                navigationName: 'DirectMessages',
            }, {
                name: 'Live and IGTV',
                component: SettingComponents.LiveIGTV,
                navigationName: 'LiveIGTV',
            }, {
                name: 'From Instagram',
                component: SettingComponents.FromInstagram,
                navigationName: 'FromInstagram',
            }, {
                name: 'SMS and Email',
                component: SettingComponents.EmailAndSMS,
                navigationName: 'EmailAndSMS',
            }
        ]
    }, {
        icon: 'lock-outline',
        name: 'Privacy',
        navigationName: 'PrivacySetting',
        component: SettingComponents.Privacy,
        child: [
            {
                icon: 'comment-outline',
                name: 'Comments',
                component: SettingComponents.Comments,
                navigationName: 'Comments',
            },
            {
                icon: 'tooltip-image-outline',
                name: 'Tags',
                component: SettingComponents.Tags,
                navigationName: 'Tags',
            },
            {
                icon: 'plus-outline',
                name: 'Story',
                component: SettingComponents.Story,
                navigationName: 'StoryPrivacy',
            },
            {
                icon: 'account-check-outline',
                name: 'Activity Status',
                component: SettingComponents.ActivityStatus,
                navigationName: 'ActivityStatus',
            },
            {
                icon: 'lock',
                name: 'Account Privacy',
                component: SettingComponents.AccountPrivacy,
                navigationName: 'AccountPrivacy',
            },
            {
                icon: 'eye-off-outline',
                name: 'Restricted Accounts',
                component: SettingComponents.RestrictedAccounts,
                navigationName: 'RestrictedAccounts',
            },
            {
                icon: 'block-helper',
                name: 'Blocked Accounts',
                component: SettingComponents.BlockedAccounts,
                navigationName: 'BlockedAccounts',
            },
            {
                icon: 'bell-off-outline',
                name: 'Muted Accounts',
                component: SettingComponents.MutedAccounts,
                navigationName: 'MutedAccounts',
            },
            {
                icon: 'account-star',
                name: 'Close Friends',
                component: SettingComponents.CloseFriends,
                navigationName: 'CloseFriends1',
            },
            {
                icon: 'account-multiple-outline',
                name: 'Accounts You Follow',
                component: SettingComponents.AccountYouFollow,
                navigationName: 'Account YouFollow',
            }
        ]
    }, {
        icon: 'shield-check-outline',
        name: 'Security',
        navigationName: 'SecuritySetting',
        component: SettingComponents.Security,
        child: [
            {
                icon: 'key-variant',
                name: 'Password',
                component: SettingComponents.Password,
                navigationName: 'PasswordModify',
            }, {
                icon: 'crosshairs',
                name: 'Login Activity',
                component: SettingComponents.LoginActivity,
                navigationName: 'LoginActivity',
            }, {
                icon: 'account-clock-outline',
                name: 'Saved Login Info',
                component: SettingComponents.SavedLoginInfo,
                navigationName: 'SavedLoginInfo',
            }, {
                icon: 'two-factor-authentication',
                name: 'Two Factor Authentication',
                component: SettingComponents.TwoFactor,
                navigationName: 'TwoFactor',
            }, {
                icon: 'email-outline',
                name: 'Email From Instagram',
                component: SettingComponents.EmailFromInstagram,
                navigationName: 'EmailFromInstagram',
            }
        ]
    }, {
        icon: 'bullhorn-outline',
        name: 'Ads',
        navigationName: 'AdsSetting',
        component: SettingComponents.Ads,
        child: [
            {
                name: 'Ad Activity',
                component: SettingComponents.AdActivity,
                navigationName: 'AdActivity',
            },
            {
                name: 'About Ads',
                component: SettingComponents.AboutAds,
                navigationName: 'AboutAds',
            }
        ]
    }, {
        icon: 'account-circle-outline',
        name: 'Account',
        navigationName: 'AccountSetting',
        component: SettingComponents.Account,
        child: [
            {
                name: 'Your Activity',
                component: SettingComponents.YourActivity,
                navigationName: 'YourActivity',
            },
            {
                name: 'Saved',
                component: SettingComponents.Saved,
                navigationName: 'Saved',
            },
            {
                name: 'SavedCollection',
                component: SettingComponents.SavedCollection,
                navigationName: 'SavedCollection',
            },
            {
                name: 'AddSavedCollection',
                component: SettingComponents.AddSavedCollection,
                navigationName: 'AddSavedCollection',
            },
            {
                name: 'EditSavedCollection',
                component: SettingComponents.EditSavedCollection,
                navigationName: 'EditSavedCollection',
            },
            {
                name: 'AddToSavedCollection',
                component: SettingComponents.AddToSavedCollection,
                navigationName: 'AddToSavedCollection',
            },
            {
                name: 'Close Friends',
                component: SettingComponents.CloseFriends,
                navigationName: 'CloseFriends',
            }, {
                name: 'Language',
                component: SettingComponents.Language,
                navigationName: 'Language',
            }, {
                name: 'Browser Autofill',
                component: SettingComponents.BrowserAutofill,
                navigationName: 'BrowserAutofill',
            }, {
                name: 'Contacts Syncing',
                component: SettingComponents.ContactSync,
                navigationName: 'ContactSync',
            }, {
                name: 'Linked Accounts',
                component: SettingComponents.LinkedAccounts,
                navigationName: 'LinkedAccounts',
            }, {
                name: 'Request Verification',
                component: SettingComponents.RequestVerification,
                navigationName: 'RequestVerification',
            },
            {
                name: `Posts You've Liked`,
                component: SettingComponents.PostYouLiked,
                navigationName: 'PostYouLiked',
            }
        ]
    },
    {
        icon: 'help-circle-outline',
        name: 'Help',
        navigationName: 'HelpSetting',
        component: SettingComponents.Help,
        child: [
            {
                name: 'Report a Problem',
                component: SettingComponents.ReportProblem,
                navigationName: 'ReportProblem',
            },
            {
                name: 'Help Center',
                component: SettingComponents.HelpCenter,
                navigationName: 'HelpCenter',
            },
            {
                name: 'Privacy and Security Help',
                component: SettingComponents.PrivacySecurityHelp,
                navigationName: 'PrivacySecurityHelp',
            }
        ]
    }, {
        icon: 'alert-circle-outline',
        name: 'About',
        navigationName: 'AboutSetting',
        component: SettingComponents.About,
        child: [
            {
                name: 'App Updates',
                component: SettingComponents.AppUpdate,
                navigationName: 'AppUpdate',
            }, {
                name: 'Data Policy',
                component: SettingComponents.DataPolicy,
                navigationName: 'DataPolicy',
            }, {
                name: 'Term of Use',
                component: SettingComponents.Term,
                navigationName: 'Term',
            }
        ]
    }
]