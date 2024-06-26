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
    SimpleLineIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Progress from "react-native-progress";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const icons = {
    Clouds: "cloudy",
    Clear: "day-sunny",
    Rain: "rain",
    Atmosphere: "cloudy-gusts",
    Snow: "snowflake",
    Drizzle: "rain",
    Thunderstorm: "lightning",
};

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

const aerosols = [
    { type: "Fiber", accuracy: 93.6 },
    { type: "Erysiphaceae", accuracy: 92.5 },
    { type: "Bacillus anthracis", accuracy: 86.5 },
    { type: "Botrytis cinerea", accuracy: 91.5 },
];

const API_KEY = "544961607c2113d21ab54ce738bff809";

export default function App() {
    const [analysis, setAnalysis] = useState(true);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [analData, setAnaldata] = useState(null);
    const [aerosData, setAerosdata] = useState(null);
    const [weather, setWeather] = useState([]);
    const [address, setAddress] = useState("Loading...");
    const [ok, setOk] = useState(true);
    const [analDone, setAnaldone] = useState(false);
    const map = () => setAnalysis(false);
    const stat = () => setAnalysis(true);
    const runModel = () => {
        console.log(pieChartData);
        return pieChartData;
    };
    const startAnal = async () => {
        const modelResult = await runModel();
        setAnaldata(modelResult);
        setAerosdata(aerosols);
    };

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
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        const json = await response.json();
        setWeather([json]);
    };
    useEffect(() => {
        getLocation();
    }, []);
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
                            <TouchableOpacity
                                style={styles.button}
                                onPress={startAnal}
                            >
                                <Text style={styles.buttonText}>ANALYSIS</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.distribution}>
                        <Text style={styles.distributionTitle}>
                            DISTRIBUTION
                        </Text>
                        <View style={styles.distributionBody}>
                            {analData ? (
                                <>
                                    <Text style={styles.pieTitle}>
                                        Aerosol Distribution
                                    </Text>
                                    <PieChart
                                        data={analData}
                                        width={390}
                                        height={220}
                                        accessor="population"
                                        chartConfig={chartConfigs}
                                        backgroundColor="#00000000"
                                        style={chartStyle}
                                        center={[15, 0]}
                                    />
                                </>
                            ) : (
                                <ActivityIndicator
                                    color="black"
                                    style={{
                                        marginTop: 0,
                                        marginLeft: 0,
                                    }}
                                    size="large"
                                />
                            )}
                        </View>
                    </View>
                    <View style={styles.status}>
                        <Text style={styles.statusTitle}>ACCURACY</Text>
                        {aerosData ? (
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
                                                progress={
                                                    aerosol.accuracy / 100
                                                }
                                                width={200}
                                                height={10}
                                                borderColor="black"
                                                color="black"
                                                borderWidth={0}
                                                unfilledColor="#3A3D4070"
                                            />
                                            <Text
                                                style={
                                                    styles.aerosolAccuracyText
                                                }
                                            >
                                                {aerosol.accuracy}%
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.statusContainer}>
                                <ActivityIndicator
                                    color="black"
                                    style={{
                                        marginTop: 20,
                                        marginLeft: 0,
                                    }}
                                    size="large"
                                />
                            </View>
                        )}
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
                        <Text style={styles.weatherTitle}>WEATHER</Text>
                        {weather.length === 0 ? (
                            <ActivityIndicator
                                color="black"
                                style={{ marginTop: 170, marginLeft: 170 }}
                                size="large"
                            />
                        ) : (
                            <>
                                <View style={styles.weatherTextbody}>
                                    <View style={styles.weatherIcon}>
                                        <Text style={styles.temp}>
                                            {parseFloat(
                                                weather[0].main.temp
                                            ).toFixed(1)}
                                        </Text>
                                        <Fontisto
                                            name={
                                                icons[
                                                    weather[0].weather[0].main
                                                ]
                                            }
                                            size={68}
                                            color="black"
                                        />
                                    </View>
                                    <Text style={styles.main}>
                                        {weather[0].weather[0].main}
                                    </Text>
                                    <Text style={styles.description}>
                                        {weather[0].weather[0].description}
                                    </Text>
                                    <Text style={styles.visibility}>
                                        Visibility: {weather[0].visibility}m
                                    </Text>
                                </View>
                                <View style={styles.envBody}>
                                    <View style={styles.env}>
                                        <View style={styles.envTitleBody}>
                                            <MaterialCommunityIcons
                                                name="weather-windy"
                                                size={13}
                                                color="black"
                                            />
                                            <Text> </Text>
                                            <Text style={styles.envTitle}>
                                                WIND
                                            </Text>
                                        </View>
                                        <View style={styles.envValueBody}>
                                            <Text style={styles.envText}>
                                                {weather[0].wind.speed}
                                            </Text>
                                            <Text>MPH</Text>
                                        </View>
                                    </View>
                                    <View style={styles.env}>
                                        <View style={styles.envTitleBody}>
                                            <MaterialCommunityIcons
                                                name="water-percent"
                                                size={13}
                                                color="black"
                                            />
                                            <Text> </Text>
                                            <Text style={styles.envTitle}>
                                                HUMIDITY
                                            </Text>
                                        </View>
                                        <View style={styles.envValueBody}>
                                            <Text style={styles.envText}>
                                                {weather[0].main.humidity}
                                            </Text>
                                            <Text>%</Text>
                                        </View>
                                    </View>
                                    <View style={styles.env}>
                                        <View style={styles.envTitleBody}>
                                            <SimpleLineIcons
                                                name="speedometer"
                                                size={13}
                                                color="black"
                                            />
                                            <Text> </Text>
                                            <Text style={styles.envTitle}>
                                                PRESSURE
                                            </Text>
                                        </View>
                                        <View style={styles.envValueBody}>
                                            <Text style={styles.envText}>
                                                {weather[0].main.pressure}
                                            </Text>
                                            <Text>hPa</Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}
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
