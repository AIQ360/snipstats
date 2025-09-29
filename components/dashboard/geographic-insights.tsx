"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, MapPin, Users, Eye, TrendingUp } from "lucide-react"

interface GeographicData {
  country: string
  visitors: number
  pageViews: number
  cities: string[]
  cityCount: number
}

interface Props {
  data: GeographicData[]
  timeRange: string
}

export function GeographicInsights({ data, timeRange }: Props) {
  const [showAll, setShowAll] = useState(false)
  const displayData = showAll ? data : data.slice(0, 8)

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No geographic data yet</h3>
        <p className="text-muted-foreground">Your global audience will show up here as you get more traffic.</p>
      </div>
    )
  }

  const totalVisitors = data.reduce((sum, country) => sum + country.visitors, 0)
  const topCountry = data[0]
  const internationalPercentage =
    data.length > 1 ? Math.round(((totalVisitors - topCountry.visitors) / totalVisitors) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Global Overview */}
      <div className="border-l-4 border-blue-500 pl-6">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="h-6 w-6 text-blue-500" />
          <h3 className="text-2xl font-bold">Your Global Reach</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Countries reached: </span>
            <span className="font-bold text-lg">{data.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Top market: </span>
            <span className="font-bold text-lg">{topCountry.country}</span>
          </div>
          <div>
            <span className="text-muted-foreground">International traffic: </span>
            <span className="font-bold text-lg">{internationalPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Country Breakdown */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Where Your Visitors Come From
        </h4>

        <div className="space-y-3">
          {displayData.map((country, index) => {
            const percentage = Math.round((country.visitors / totalVisitors) * 100)
            const isTopCountry = index === 0

            return (
              <div
                key={country.country}
                className={`p-4 rounded-lg border transition-all ${
                  isTopCountry
                    ? "bg-gradient-to-r from-blue-50 to-transparent border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-bold text-lg">{country.country}</h5>
                        {isTopCountry && <Badge className="bg-yellow-500 text-white">Top Market</Badge>}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {country.visitors} visitors ({percentage}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {country.pageViews} page views
                        </span>
                        {country.cityCount > 0 && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {country.cityCount} cities
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full sm:w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isTopCountry ? "bg-blue-500" : "bg-gray-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Top cities preview */}
                {country.cities.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-muted-foreground mb-2">Top cities:</p>
                    <div className="flex flex-wrap gap-1">
                      {country.cities.slice(0, 5).map((city) => (
                        <Badge key={city} variant="outline" className="text-xs">
                          {city}
                        </Badge>
                      ))}
                      {country.cities.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{country.cities.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Show more/less button */}
        {data.length > 8 && (
          <div className="text-center pt-4">
            <Button variant="outline" onClick={() => setShowAll(!showAll)} className="rounded-full">
              {showAll ? `Show less` : `Show all ${data.length} countries`}
            </Button>
          </div>
        )}
      </div>

      {/* Geographic Insights */}
      <div className="border-l-4 border-green-500 pl-6">
        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Geographic Insights
        </h4>
        <div className="space-y-3 text-sm">
          {data.length >= 5 && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="font-medium text-green-800">🌍 Global Appeal</p>
              <p className="text-green-700">
                Your content resonates across {data.length} countries - you're building a truly global audience!
              </p>
            </div>
          )}

          {topCountry.visitors > totalVisitors * 0.6 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="font-medium text-blue-800">🎯 Strong Home Market</p>
              <p className="text-blue-700">
                {topCountry.country} represents {Math.round((topCountry.visitors / totalVisitors) * 100)}% of your
                traffic - consider creating more localized content.
              </p>
            </div>
          )}

          {internationalPercentage > 40 && (
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <p className="font-medium text-purple-800">🚀 International Growth</p>
              <p className="text-purple-700">
                {internationalPercentage}% of your traffic comes from outside {topCountry.country} - great international
                reach!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
