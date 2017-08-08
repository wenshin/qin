# qin
a app flow for browser inspired by koa

app

history

location
  href
  path
  pathname
  search
  hash
  meta: {
    os: ( Android@x.x.x | IOS@x.x.x | Windows@10 | MacOS@x.x.x | Linux@x.x.x )
    device: ( Iphone5 | Iphone6 | Nexus | Lenovo | ASUS )
    devicetype: ( phone | laptop | desktop | watch | pad )
    app: ( meituan@x.x.x | maoyan@x.x.x | maoyanpro@x.x.x | dianping@x.x.x | chrome@x.x.x )
    apptype: ( mobile-native | pc-native | pc-web | mobile-web )
    platform:  ( nativeapp | browser | webview )
  }

tour
  new Tour({
    id: 'optional',
    meta: {
      os: ( Android@x.x.x | IOS@x.x.x | Windows@10 | MacOS@x.x.x | Linux@x.x.x )
      device: ( Iphone5 | Iphone6 | Nexus | Lenovo | ASUS )
      devicetype: ( phone | laptop | desktop | watch | pad )
      app: ( meituan@x.x.x | maoyan@x.x.x | maoyanpro@x.x.x | dianping@x.x.x | chrome@x.x.x )
      apptype: ( mobile-native | pc-native | pc-web | mobile-web )
      platform:  ( nativeapp | browser | webview )
    },
    location
  })
  tour.start(location) {location, time, }
  tour.arrive()
