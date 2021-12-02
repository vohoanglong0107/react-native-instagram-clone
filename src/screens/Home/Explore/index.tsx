import React, { useState, useRef } from 'react'
import { StyleSheet, TouchableOpacity, TextInput, View, SafeAreaView } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { SCREEN_WIDTH, SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../../constants'
import SearchResult from '../../../components/SearchResult'
import { getTabBarHeight } from '../../../components/BottomTabBar'
import RecommendPostList from '../../../components/Recommend/RecommendPostList'
const index = () => {
    const [query, setQuery] = useState<string>('')
    const [typing, setTyping] = useState<boolean>(false)
    const inputRef = useRef<TextInput>(null)
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchWrapper}>
                {typing ? (
                    <TouchableOpacity
                        onPress={() => {
                            setTyping(false)
                            inputRef.current?.blur()
                        }}
                        style={styles.squareBtn}>
                        <Icon name="arrow-left" size={20} />
                    </TouchableOpacity>
                ) : (
                        <View style={styles.squareBtn}>
                            <Icon name="magnify" size={20} />
                        </View>
                    )}
                <TextInput
                    ref={inputRef}
                    onFocus={setTyping.bind(null, true)}
                    placeholder="Search"
                    onChangeText={setQuery}
                    value={query}
                    autoCapitalize="none"
                    style={{
                        ...styles.searchInput,
                        width: SCREEN_WIDTH - (typing ? 44 : 88),
                    }}
                />
                {!typing && <TouchableOpacity style={styles.squareBtn}>
                    <Icon name="qrcode-scan" size={20} />
                </TouchableOpacity>}
                {typing &&
                    <View style={styles.searchResultWrapper}>
                        <SearchResult query={query} />
                    </View>
                }
            </View>
            <RecommendPostList containerStyle={{
                maxHeight: SCREEN_HEIGHT - STATUS_BAR_HEIGHT - 44 - 40 - getTabBarHeight(),
                overflow: 'hidden'
            }} />
        </SafeAreaView >
    )
}

export default index

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: '100%',
        backgroundColor: '#fff'
    },
    searchWrapper: {
        zIndex: 1,
        width: '100%',
        height: 44,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    searchInput: {
        height: '100%',

        fontSize: 16
    },
    squareBtn: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchResultWrapper: {
        height: SCREEN_HEIGHT - 44 - STATUS_BAR_HEIGHT - getTabBarHeight(),
        position: 'absolute',
        top: 44,
        left: 0,
        width: "100%"
    }
})
