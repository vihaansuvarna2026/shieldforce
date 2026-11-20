plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.shieldforce.moneyville"
    compileSdk = 36

    defaultConfig {
        // NOTE: applicationId is permanent once the app is first uploaded to
        // Google Play — it can never be changed for that listing. Change it
        // here before the first upload if you want a different one.
        applicationId = "com.shieldforce.moneyville"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"

        resourceConfigurations += listOf("en")
    }

    signingConfigs {
        // Release signing is supplied by keystore.properties, which is NOT in
        // git. See android/README.md. Without it, assembleRelease produces an
        // unsigned artifact rather than failing the build.
        create("release") {
            val props = java.util.Properties()
            val file = rootProject.file("keystore.properties")
            if (file.exists()) {
                file.inputStream().use(props::load)
                storeFile = rootProject.file(props.getProperty("storeFile"))
                storePassword = props.getProperty("storePassword")
                keyAlias = props.getProperty("keyAlias")
                keyPassword = props.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            if (rootProject.file("keystore.properties").exists()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
    }

    // The game's own assets are pre-minified; re-compressing them in the APK
    // costs install size and decompression time at launch for no gain.
    androidResources {
        noCompress += listOf("png", "webp")
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        buildConfig = true
    }

    packaging {
        resources.excludes += setOf("META-INF/*.version", "META-INF/LICENSE*", "DebugProbesKt.bin")
    }
}

dependencies {
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.webkit)
    implementation(libs.androidx.splashscreen)
    implementation(libs.androidx.activity)
}

/* ---------------------------------------------------------------------------
   The web app in ../moneyville is the single source of truth. This copies the
   files the app actually loads at runtime into assets/www before every build,
   so the two can never drift apart. Source files (js/, css/), the build
   script and node_modules are deliberately left out — index.html loads only
   the bundle in dist/.
   ------------------------------------------------------------------------ */
val webRoot = rootProject.file("../moneyville")
val syncWebAssets by tasks.registering(Sync::class) {
    description = "Copy the MoneyVille web build into the APK's assets."
    group = "build"
    from(webRoot) {
        include("index.html")
        include("manifest.webmanifest")
        include("dist/**")
        include("icon-192.png", "icon-512.png", "icon-maskable-512.png", "icon.svg")
    }
    into(layout.buildDirectory.dir("generated/webAssets/www"))
}

android.sourceSets.getByName("main").assets.srcDir(
    layout.buildDirectory.dir("generated/webAssets").map { it.asFile.path }
)

tasks.withType<com.android.build.gradle.tasks.MergeSourceSetFolders>().configureEach {
    dependsOn(syncWebAssets)
}

// Fail loudly rather than shipping an APK with no game in it.
tasks.named("preBuild") {
    doFirst {
        val bundle = File(webRoot, "dist/moneyville.min.js")
        check(bundle.isFile) {
            "Web bundle missing at ${bundle.path} — run `npm run build` in moneyville/ first."
        }
    }
}
