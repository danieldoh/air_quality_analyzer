import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { theme } from "./colors";
import { pieChartData } from "./data";
import { styles } from "./styles";
import { mapStyle } from "./map";
import { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import MapView from "react-native-maps";
import { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import {
    MaterialIcons,
    MaterialCommunityIcons,
    Fontisto,
    AntDesign,
    Octicons,
    Entypo,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Progress from "react-native-progress";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const chartConfigs = {
    backgroundColor: "#26872a",
    backgroundGradientFrom: "#43a047",
    backgroundGradientTo: "#66bb6a",
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "6",
        strokeWidth: "1",
        stroke: "#ffa726",
    },
};

const chartStyle = {
    marginVertical: 20,
    borderRadius: 16,
};

export default function App() {
    const [analysis, setAnalysis] = useState(true);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [address, setAddress] = useState("Loading...");
    const [ok, setOk] = useState(true);
    const map = () => setAnalysis(false);
    const stat = () => setAnalysis(true);

    const getLocation = async () => {
        const { granted } = await Location.requestForegroundPermissionsAsync();
        if (!granted) {
            setOk(false);
        }
        const {
            coords: { latitude, longitude },
        } = await Location.getCurrentPositionAsync({ accuracy: 5 });
        const location = await Location.reverseGeocodeAsync(
            { latitude, longitude },
            { useGoogleMaps: false }
        );
        setLatitude(latitude);
        setLongitude(longitude);
        setAddress(location[0].formattedAddress);
        console.log(latitude, longitude);
        console.log(location);
    };
    useEffect(() => {
        getLocation();
    }, []);
    const aerosols = [
        { type: "Fiber", accuracy: 93.6 },
        { type: "Erysiphaceae", accuracy: 92.5 },
        { type: "Bacillus anthracis", accuracy: 86.5 },
        { type: "Botrytis cinerea", accuracy: 91.5 },
    ];
    const [image, setImage] = useState(null);
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };
    let accuracy = null;
    return (
        <View style={styles.container}>
            <View style={styles.title}>
                <Text style={styles.titleText}>AIR QUALITY</Text>
                <Text style={styles.subtitleText}>Smart Farm</Text>
            </View>
            {analysis ? (
                <View style={styles.body}>
                    <View style={styles.imageBody}>
                        <Text style={styles.imageText}>IMAGE</Text>
                        <TouchableOpacity
                            style={styles.imageContainer}
                            onPress={pickImage}
                        >
                            {image ? (
                                <Image
                                    source={{ uri: image }}
                                    style={styles.image}
                                />
                            ) : (
                                <>
                                    <MaterialIcons
                                        name="add-photo-alternate"
                                        size={50}
                                        color="black"
                                    />
                                    <Text style={styles.importText}>
                                        Click to import image.
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button}>
                                <Text style={styles.buttonText}>ANALYSIS</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.distribution}>
                        <Text style={styles.distributionTitle}>
                            DISTRIBUTION
                        </Text>
                        <View style={styles.distributionBody}>
                            <Text style={styles.pieTitle}>
                                Aerosol Distribution
                            </Text>
                            <View>
                                <PieChart
                                    data={pieChartData}
                                    width={390}
                                    height={220}
                                    accessor="population"
                                    chartConfig={chartConfigs}
                                    backgroundColor="#00000000"
                                    style={chartStyle}
                                    center={[15, 0]}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.status}>
                        <Text style={styles.statusTitle}>ACCURACY</Text>
                        <ScrollView>
                            {aerosols.map((aerosol, index) => (
                                <View
                                    key={index}
                                    style={styles.statusContainer}
                                >
                                    <Text style={styles.aerosolTypeText}>
                                        {aerosol.type}
                                    </Text>
                                    <View style={styles.accuracy}>
                                        <Progress.Bar
                                            progress={aerosol.accuracy / 100}
                                            width={200}
                                            height={10}
                                            borderColor="black"
                                            color="black"
                                            borderWidth={0}
                                            unfilledColor="#3A3D4070"
                                        />
                                        <Text
                                            style={styles.aerosolAccuracyText}
                                        >
                                            {aerosol.accuracy}%
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            ) : (
                <View style={styles.body2}>
                    <View style={styles.mapBody}>
                        <Text style={styles.mapText}>MAP</Text>
                        {latitude && longitude ? (
                            <>
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: latitude,
                                        longitude: longitude,
                                        latitudeDelta: 0.003,
                                        longitudeDelta: 0.003,
                                    }}
                                    provider={PROVIDER_GOOGLE}
                                    customMapStyle={mapStyle}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude: latitude,
                                            longitude: longitude,
                                        }}
                                        pinColor="#2D63E2"
                                        title="Current Location"
                                    />
                                </MapView>
                                <View style={styles.addressBody}>
                                    <MaterialIcons
                                        name="my-location"
                                        size={20}
                                        color="black"
                                    />
                                    <Text> </Text>
                                    <Text style={styles.address}>
                                        {address}
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <ActivityIndicator
                                color="black"
                                style={{ marginTop: 170, marginLeft: 330 }}
                                size="large"
                            />
                        )}
                    </View>
                    <View style={styles.weatherBody}>
                        <Text style={styles.weatherText}>WEATHER</Text>
                    </View>
                </View>
            )}
            <View style={styles.navigatorContainer}>
                <View style={styles.navigator}>
                    <TouchableOpacity
                        style={styles.navigatorTab}
                        onPress={stat}
                    >
                        <Fontisto
                            name="bar-chart"
                            size={24}
                            color={analysis ? "black" : theme.grey}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navigatorTab} onPress={map}>
                        <Fontisto
                            name="map-marker-alt"
                            size={24}
                            color={analysis ? theme.grey : "black"}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
