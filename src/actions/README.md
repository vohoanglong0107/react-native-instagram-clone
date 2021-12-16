# Comments actions <!-- omit in toc -->

## Contents of this Document <!-- omit in toc -->
- [Source code structures](#source-code-structures)
  - [commentActions.ts](#commentactionsts)
  - [messageActions.ts](#messageactionsts)
- [notificationActions.ts](#notificationactionsts)
- [postActions.ts](#postactionsts)
- [profileXActions.ts](#profilexactionsts)
- [storyActions.ts](#storyactionsts)
## Source code structures

    .
    ├── commentActions.ts
    ├── messageActions.ts
    ├── notificationActions.ts
    ├── postActions.ts
    ├── profileXActions.ts
    ├── storyActions.ts
    └── userActions.ts

### commentActions.ts
This module is populated by comment related actions, including:
- Fetch comments
- Load more comments
- Toggle react on comments and reply
- Post reply to comment

### messageActions.ts
This module is populated by message related actions, including:
- Trigger message listener
- Create message
- React to message
- Undo sent message
- Create new conversation when no message has been made between 2 user

## notificationActions.ts
This module is populated by notification related actions, including:
- Fetch notifications
- Create notifications

## postActions.ts
This module is populated by post related actions, including:
- Fetch posts
- Load more posts
- Toggle react on post
- Post comment to post (It sounded really weird)

## profileXActions.ts
This module is populated by profile related actions, including:
- Fetch profile
- Reset profile

## storyActions.ts
This module is populated by story related actions, including:
