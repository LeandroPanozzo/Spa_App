// app.config.js
export default {
    expo: {
      name: "Sentirse Bien",
      slug: "myFirstApp",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/logoapp.png",
      userInterfaceStyle: "light",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      extra: {
        API_URL: process.env.API_URL, // Usando la variable de entorno correctamente
        eas: {
          projectId: "6a9d1c9d-5b9b-4304-b0f0-8d689250321e"
        }
      },
      ios: {
        supportsTablet: true
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/logoapp.png",
          backgroundColor: "#ffffff"
        },
        package: "com.wacallo.myFirstApp"
      },
      web: {
        favicon: "./assets/logoapp.png"
      },
      platforms: ["ios", "android", "web"]
    }
  };
  