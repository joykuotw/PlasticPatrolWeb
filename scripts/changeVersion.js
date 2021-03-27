import plist from 'plist';
import { readFileSync, writeFileSync } from 'fs';

const infoFilePath = "ios/App/App/Info.plist";
const gradleFilePath = "android/app/build.gradle";

// read version
const version = process.env.REACT_APP_VERSION || "1.1.1";

// Android
const versionSplit = version.split(".");
const newAndroidVersionCode = versionSplit[0] * 10000000 + versionSplit[1] * 10000 + parseInt(versionSplit[2]);
console.log("android-versionCode:", newAndroidVersionCode);
console.log("android-versionName:", version);
const gradleContent = readFileSync(gradleFilePath, 'utf8');
const regexVersionCode = /versionCode [0-9]+/;
const regexVersionName = /versionName ".*"/;
const newGradleContent = gradleContent.replace(regexVersionCode, `versionCode ${newAndroidVersionCode}`);
const latestGradleContent = newGradleContent.replace(regexVersionName, `versionName "${version}"`);
writeFileSync(gradleFilePath, latestGradleContent);

// IOS
const newIosCFBundleVersion = version;
const newIosCFBundleShortVersionString = version;
console.log("ios-CFBundleVersion:", newIosCFBundleVersion);
console.log("ios-CFBundleShortVersionString:", newIosCFBundleShortVersionString);
const obj = plist.parse(readFileSync(infoFilePath, 'utf8'));
obj.CFBundleVersion = newIosCFBundleVersion;
obj.CFBundleShortVersionString = newIosCFBundleShortVersionString;
writeFileSync(infoFilePath, plist.build(obj));
