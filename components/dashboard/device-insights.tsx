"use client"

import { Badge } from "@/components/ui/badge"
import {
  Smartphone,
  Monitor,
  Tablet,
  Chrome,
  AppleIcon as Safari,
  ChromeIcon as Firefox,
  Users,
  TrendingUp,
} from "lucide-react"

interface DeviceData {
  devices: { category: string; visitors: number }[]
  browsers: { browser: string; visitors: number }[]
  operatingSystems: { os: string; visitors: number }[]
}

interface Props {
  data: DeviceData
  timeRange: string
}

const getDeviceIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "mobile":
      return <Smartphone className="h-5 w-5" />
    case "desktop":
      return <Monitor className="h-5 w-5" />
    case "tablet":
      return <Tablet className="h-5 w-5" />
    default:
      return <Monitor className="h-5 w-5" />
  }
}

const getBrowserIcon = (browser: string) => {
  const browserLower = browser.toLowerCase()
  if (browserLower.includes("chrome")) return <Chrome className="h-4 w-4" />
  if (browserLower.includes("safari")) return <Safari className="h-4 w-4" />
  if (browserLower.includes("firefox")) return <Firefox className="h-4 w-4" />
  return <div className="h-4 w-4 bg-gray-400 rounded" />
}

export function DeviceInsights({ data, timeRange }: Props) {
  if (!data || (!data.devices.length && !data.browsers.length && !data.operatingSystems.length)) {
    return (
      <div className="text-center py-12">
        <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No device data yet</h3>
        <p className="text-muted-foreground">Device and browser analytics will appear here as you get more traffic.</p>
      </div>
    )
  }

  const totalDeviceVisitors = data.devices.reduce((sum, device) => sum + device.visitors, 0)
  const mobileDevice = data.devices.find((d) => d.category.toLowerCase() === "mobile")
  const desktopDevice = data.devices.find((d) => d.category.toLowerCase() === "desktop")
  const mobilePercentage = mobileDevice ? Math.round((mobileDevice.visitors / totalDeviceVisitors) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Device Overview */}
      <div className="border-l-4 border-purple-500 pl-6">
        <div className="flex items-center gap-3 mb-3">
          <Smartphone className="h-6 w-6 text-purple-500" />
          <h3 className="text-2xl font-bold">How People Access Your Site</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Mobile traffic: </span>
            <span className="font-bold text-lg">{mobilePercentage}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Top browser: </span>
            <span className="font-bold text-lg">{data.browsers[0]?.browser || "N/A"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Device types: </span>
            <span className="font-bold text-lg">{data.devices.length}</span>
          </div>
        </div>
      </div>

      {/* Device Breakdown */}
      {data.devices.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Device Categories
          </h4>

          <div className="space-y-3">
            {data.devices.map((device, index) => {
              const percentage = Math.round((device.visitors / totalDeviceVisitors) * 100)
              const isMobile = device.category.toLowerCase() === "mobile"

              return (
                <div
                  key={device.category}
                  className={`p-4 rounded-lg border transition-all ${
                    isMobile
                      ? "bg-linear-to-r from-purple-50 to-transparent border-purple-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${isMobile ? "bg-purple-500" : "bg-gray-500"} text-white`}>
                        {getDeviceIcon(device.category)}
                      </div>
                      <div>
                        <h5 className="font-bold text-lg capitalize">{device.category}</h5>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {device.visitors} visitors ({percentage}%)
                        </div>
                      </div>
                    </div>

                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isMobile ? "bg-purple-500" : "bg-gray-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Browser Breakdown */}
      {data.browsers.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold flex items-center gap-2">
            <Chrome className="h-5 w-5" />
            Top Browsers
          </h4>

          <div className="grid md:grid-cols-2 gap-3">
            {data.browsers.slice(0, 6).map((browser, index) => {
              const totalBrowserVisitors = data.browsers.reduce((sum, b) => sum + b.visitors, 0)
              const percentage = Math.round((browser.visitors / totalBrowserVisitors) * 100)

              return (
                <div
                  key={browser.browser}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getBrowserIcon(browser.browser)}
                    <div>
                      <p className="font-medium">{browser.browser}</p>
                      <p className="text-sm text-muted-foreground">{browser.visitors} visitors</p>
                    </div>
                  </div>
                  <Badge variant="outline">{percentage}%</Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Operating Systems */}
      {data.operatingSystems.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold">Operating Systems</h4>

          <div className="grid md:grid-cols-2 gap-3">
            {data.operatingSystems.slice(0, 6).map((os) => {
              const totalOSVisitors = data.operatingSystems.reduce((sum, o) => sum + o.visitors, 0)
              const percentage = Math.round((os.visitors / totalOSVisitors) * 100)

              return (
                <div key={os.os} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-medium">{os.os}</p>
                    <p className="text-sm text-muted-foreground">{os.visitors} visitors</p>
                  </div>
                  <Badge variant="outline">{percentage}%</Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Device Insights */}
      <div className="border-l-4 border-orange-500 pl-6">
        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Device Optimization Tips
        </h4>
        <div className="space-y-3 text-sm">
          {mobilePercentage > 60 && (
            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <p className="font-medium text-orange-800">📱 Mobile-First Audience</p>
              <p className="text-orange-700">
                {mobilePercentage}% of your traffic is mobile - make sure your site loads fast on phones!
              </p>
            </div>
          )}

          {mobilePercentage < 30 && desktopDevice && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="font-medium text-blue-800">💻 Desktop-Heavy Traffic</p>
              <p className="text-blue-700">
                Most visitors use desktop - consider rich content experiences and detailed layouts.
              </p>
            </div>
          )}

          {data.browsers[0] && data.browsers[0].browser.toLowerCase().includes("chrome") && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="font-medium text-green-800">🌐 Chrome Dominant</p>
              <p className="text-green-700">Chrome users dominate - you can use modern web features with confidence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
