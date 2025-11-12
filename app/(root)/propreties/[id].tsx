import {View, Text} from 'react-native'
import React from 'react'
import {useLocalSearchParams} from "expo-router";

const Proprety = () => {
    const {id} = useLocalSearchParams()
    return (
        <View>
            <Text>Proprety{id}</Text>
        </View>
    )
}
    export default Proprety;
