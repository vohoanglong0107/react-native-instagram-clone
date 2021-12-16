import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { RecommendPost } from './RecommendPostList'
import FastImage from 'react-native-fast-image'
import { SCREEN_WIDTH } from '../../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { navigate } from '../../navigations/rootNavigation'
export interface RecommendItemProps {
    item: RecommendPost,
    index: number,
}
const ITEM_SIZE = (SCREEN_WIDTH - 6) / 3
const RecommendItem = ({ item, index }: RecommendItemProps) => {
    const _onViewPost = () => {
        navigate('PostDetail', {
            postId: item.uid
        })
    }
    return (
        <TouchableOpacity
            style={{
                marginHorizontal: (index - 1) % 3 === 0 ? 3 : 0,
                marginBottom: 3,
                overflow: 'hidden'
            }}
            activeOpacity={0.8}
            onPress={_onViewPost}
        >
            <FastImage
                source={{
                    uri: item.source
                        && item.source[0].uri
                }}
                style={{
                    width: ITEM_SIZE,
                    height: ITEM_SIZE
                }}
            />
            {(item.source && item.source.length > 1) &&
                <View style={{
                    position: 'absolute',
                    top: 10,
                    right: 10
                }}>
                    <Icon name="layers" size={24} color="#fff" />
                </View>
            }
        </TouchableOpacity >
    )
}

export default React.memo(RecommendItem)

const styles = StyleSheet.create({})
