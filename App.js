
<script src="http://localhost:8097"></script>
import ReactDOM from 'react-dom'
import {View,Alert,Button,ActivityIndicator,FlatList,SectionList,Image,TouchableOpacity,StyleSheet, Text, SafeAreaView } from "react-native";
import { useState, useEffect } from "react";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import { myTopTracks, albumTracks } from "./utils/apiOptions";
import { REDIRECT_URI, SCOPES, CLIENT_ID, ALBUM_ID } from "./utils/constants";
import Colors from "./Themes/colors"
import React, {Component} from 'react';
import axios from "axios";
import {WebView} from 'react-native-webview'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Endpoints for authorizing with Spotify
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token"
};





export default function App() {
  const [searchKey, setSearchKey] = useState("")
  const [artists, setArtists] = useState([])
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: CLIENT_ID,
      scopes: SCOPES,
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: REDIRECT_URI
    },
    discovery
  );

  const millisToMinutesAndSeconds = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };



  function HomeScreen({ navigation }) {
    return (
      <SafeAreaView style={styles.container}>


        {contentDisplayed}
        {isLoading ? <ActivityIndicator/> : (
          <FlatList
            data={data}
            keyExtractor={({ id }, index) => id}
            renderItem={({ item }) => (
              <SafeAreaView>



              <TouchableOpacity style={styles.Button} onPress={() => {
                navigation.navigate('Preview', {
                itemId:item.preview_url,
              });
            }}>
              <Image
              style={styles.tinyLogo}
              source={require('./assets/Spotify-Play-Button.png')}/>
              </TouchableOpacity>


              <TouchableOpacity style={styles.Button} onPress={() => {
                navigation.navigate('Info', {
                itemId:item.external_urls,
              });
            }}>
              <Text style={{ color: "white" }}>{item.name},{millisToMinutesAndSeconds(item.duration_ms)}</Text>
              </TouchableOpacity>

              </SafeAreaView>
            )}
          />
        )}
      </SafeAreaView>
    );
  }


  function NotificationsScreen({ route, navigation }) {
    const { itemId } = route.params;
    const WebPage = itemId.spotify;
    //const WebPage = {JSON.stringify(itemId)};
    return (
         <SafeAreaView style={{flex: 1}}>
         <WebView source={{uri: WebPage }} />
         </SafeAreaView>

     );
  }

  function SettingsScreen({ route, navigation }) {
    const { itemId } = route.params;
    //const WebPage = {JSON.stringify(itemId)};
    return (
         <SafeAreaView style={{flex: 1}}>
         <WebView source={{uri: itemId }} />
         </SafeAreaView>

     );
  }


  const Stack = createNativeStackNavigator();

  function MyStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen options={{headerShown: false}} name="Home" component={HomeScreen} />
        <Stack.Screen name="Info" component={NotificationsScreen} />
        <Stack.Screen name="Preview" component={SettingsScreen} />
      </Stack.Navigator>
    );
  }



const search = async () => {
   try {
    const FETCH_URL = 'https://api.spotify.com/v1/albums/4aawyAB9vmqN3uQ7FjRGTy/tracks';
    const response = await fetch(FETCH_URL, {
     method: 'GET',
     headers: new Headers({
       Accept: "application/json",
       Authorization: "Bearer " + token,
     })
     })
    const json = await response.json();
    setData(json.items);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}



function search1() {
  axios(`https://api.spotify.com/v1/albums/4aawyAB9vmqN3uQ7FjRGTy/tracks`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
  .then(response => response.json())
  .then(json => console.log('json', json));
  //  setArtists(data.artists.items)
  //  {renderArtists()}

}




  class SpotifyAuthButton extends React.Component {
    render() {
        return(
         <TouchableOpacity style={styles.Button} onPress={()=>{promptAsync()}}>
         <Image
         style={styles.tinyLogo}
         source={require('./assets/spotify-logo.png')}/>
         <Text style={{ color: "white" }}>CONNECT WITH SPOTIFY</Text>
         </TouchableOpacity>
       );
  }}

  class Sectionlist extends React.Component {
    render() {
        return(

         <Text style={{ color: "white" }}>CONNECTED WITH SPOTIFY</Text>

       );
  }}




  let contentDisplayed =null
  if (token){
    contentDisplayed =<Sectionlist/>
  }else{
    contentDisplayed =<SpotifyAuthButton/>
  }

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      setToken(access_token);
    }
  }, [response]);

  useEffect(() => {
    if (token) {

      search();
      // TODO: Select which option you want: Top Tracks or Album Tracks

      // Comment out the one you are not using
      //myTopTracks(setTracks, token);
      //albumTracks(ALBUM_ID, setTracks, token);
    }
  }, [token]);




  return (


    <NavigationContainer>
    <MyStack />
    </NavigationContainer>



  );

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    padding: 24
  },
  tinyLogo: {
     width: 10,
     height: 10,
     resizeMode: 'contain'
   },
});
