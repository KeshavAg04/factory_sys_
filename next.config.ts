import withPWAInit from 'next-pwa'

const isDev =
  process.env.NODE_ENV === 'development'

const withPWA = withPWAInit({

  dest: 'public',

  disable: isDev,

  register: true,

  skipWaiting: true,

})

const nextConfig = {

  reactStrictMode: false,

}

export default withPWA(nextConfig)