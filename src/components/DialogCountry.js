import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    FlatList,
    Platform,
    TextInput,
    Modal
} from 'react-native';
import Fuse from 'fuse.js'
import { Colors, Styles } from "../styles";
import { getStatusBarHeight } from "react-native-status-bar-height";
import data from "../constans/countries.json"
import { ZVectorIcons, Text } from "../elements";
import _ from "lodash";
let delayFnc = () => { };
const debounce = _.debounce(() => delayFnc(), 100);

const ItemTemplate = ({ name, emoji, code }) => {
    return (
        <View style={styles.item}>
            <Text style={{ fontSize: Platform.OS === 'ios' ? 28 : 20, lineHeight: 30 }}>{emoji}</Text>
            <Text style={styles.currencyName}>{code}</Text>
            <Text style={styles.commonName}>{name}</Text>
        </View>
    );
}

let onSelectItem = () => { }

export const DialogCountry = () => {
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState("");
    const [listCountry, setListCountry] = useState(data);
    const maxHeight = 0.8;
    const [height, setHeight] = useState(maxHeight);

    useEffect(() => {
        showComponent();
        return () => {
            setVisible(false);
            setSearch("");
        };
    }, []);

    const options = Object.assign({
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['name', 'code'],
        id: 'id'
    });

    const fuse = new Fuse(
        data.reduce(
            (acc, item) => [
                ...acc,
                { id: item.code, name: item.name, code: item.code }
            ],
            []
        ),
        options
    );


    function showComponent() {
        window.showCountryPicker = (onSelect) => {
            onSelectItem = onSelect;
            setVisible(true);
            StatusBar.setHidden(true);
        };
    }
    const onSelect = (item) => {
        setSearch("");
        handleFilterChange("");
        StatusBar.setHidden(false);
        if (onSelectItem) onSelectItem(item);
        setVisible(false)
    }
    const renderItem = ({ item }) => {
        return <TouchableOpacity onPress={() => onSelect(item)}>
            <ItemTemplate {...item} />
        </TouchableOpacity>
    }

    let _flatList = undefined;

    const handleFilterChange = value => {
        setSearch(value);

        delayFnc = async () => {
            let listDataFilter = [];
            if (value === "") {
                listDataFilter = data;
            } else {
                const filteredCountries = fuse.search(value)

                if (_flatList) _flatList.scrollToOffset({ offset: 0 });
                filteredCountries.map(n => {
                    const item = data.filter(i => i.code === n.toString());
                    if (item.length > 0) listDataFilter.push(item[0])

                })
            }
            setListCountry(listDataFilter);
        }
        debounce();
    }

    return (
        <Modal
            visible={visible}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.titleModal}>{"Country"}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            setVisible(false);
                            setSearch("");
                            handleFilterChange("");
                            StatusBar.setHidden(false);
                        }}
                        style={styles.searchClose}>
                        <ZVectorIcons Feather size={30} color={Colors.white} name="x" />
                    </TouchableOpacity>
                </View>
                <View style={styles.search}>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            autoFocus
                            onChangeText={(text) => handleFilterChange(text)}
                            value={search}
                            placeholder={"Search"}
                            placeholderTextColor={Colors.textFieldColor}
                            style={[styles.textTitleSmallerWhite, styles.textInput]}
                            onFocus={() => setHeight(0.4)}
                            onBlur={() => setHeight(maxHeight)}
                        />
                    </View>
                </View>
                <View style={{ backgroundColor: Colors.backgroundCurrency }}>
                    <FlatList
                        keyboardShouldPersistTaps={'handled'}
                        ref={(ref) => _flatList = ref}
                        data={listCountry}
                        renderItem={renderItem}
                        keyExtractor={item => item.code}
                        ListEmptyComponent={() => <View style={styles.listNullContainer}>
                            <Text >{"Empty data"}</Text>
                        </View>} />
                </View>
            </View>
        </Modal>
    );
}


const styles = StyleSheet.create({
    container: {
        paddingTop: getStatusBarHeight(),
        backgroundColor: Colors.backgroundCurrency,
        height: Styles.window.height
    },
    title: {
        fontSize: 18,
        color: Colors.white,
        fontWeight: "700"
    },
    item: {
        flexDirection: "row",
        paddingVertical: 15,
        alignItems: "center",
        paddingHorizontal: 25
    },
    currencyName: {
        color: Colors.white,
        fontWeight: "bold",
        textAlign: "center",
        width: 100,
        fontSize: 16,
        marginBottom: Platform.OS === "ios" ? 5 : 0
    },
    commonName: {
        color: Colors.athensGray,
        marginBottom: Platform.OS === "ios" ? 5 : 0,
        marginHorizontal: 20,
        fontSize: 14
    },
    search: {
        height: 40,
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    textInputContainer: {
        borderRadius: 7,
        backgroundColor: "#0c1f40",
        flex: 1,
        justifyContent: "center",
    },
    textTitleSmallerWhite: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.white
    },
    textInput: {
        padding: 10,
        flex: 1
    },
    searchClose: {
        alignItems: "flex-end",
        marginLeft: 10
    },
    listNullContainer: {
        ...Styles.center,
        marginTop: 50
    },
    header: {
        ...Styles.justifyContent,
        alignItems: "center",
        marginHorizontal: 5,
        marginBottom: 10,
        marginHorizontal: 20
    },
    titleModal: {
        fontSize: 24,
        fontWeight: "600",
        color: Colors.white,
    },
});
