"use client"

import Link from "next/link"
import Image from "next/image"
import {
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Clock,
  MousePointer,
  Camera,
  Globe,
  Zap,
  Lightbulb,
  Target,
  Eye,
  Download,
  Share2,
  TrendingUp,
  Star,
  Code,
  Twitter,
  Linkedin,
  Trophy,
  Activity,
  FileText,
  BarChart,
  Copy,
  Bookmark,
  Rocket,
  X,
  Lock,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const LandingHome = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section with Split Layout */}
      <section className=" mx-auto px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="max-w-xl">
            <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-md px-4 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-600" />
              Built by an indie, for indies
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight text-[#383633]">
              Beautiful Analytics for{" "}
              <span className="relative inline-block">
                <span className="relative z-10 border-b-2 border-teal-500 text-[#383633]">Indie Makers</span>
              </span>
            </h1>
            <p className="text-xl text-[#383633]/80 max-w-2xl mb-10">
              Transform your Google Analytics data into clean, beautiful, and social-media-ready visuals. Perfect for
              Indie Makers and small startups.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button asChild size="lg" className="bg-[#383633] hover:bg-[#383633]/90 rounded-md px-8 group">
                <Link href="/sign-up" className="flex items-center">
                  Share Your Wins Now
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <span className="text-[#383633]/70 text-sm flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-teal-600" />
                <span>
                  Takes <span className="font-semibold">2 minutes</span> to set up
                </span>
              </span>
            </div>
          </div>

          {/* Hero Mockup Section */}
          <div className="relative">
            {/* Code-styled Stats Mockup */}
            <div className="bg-[#383633] rounded-md p-4 shadow-md max-w-md ml-auto relative z-10">
              <div className="flex items-center mb-3 text-white/50 text-xs">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="ml-3">snipstats.com</div>
              </div>
              <div className="font-mono text-xs text-white/80">
                <p className="text-pink-300">
                  const <span className="text-emerald-300">todaysStats</span> = {`{`}
                </p>
                <p className="ml-4">
                  <span className="text-blue-300">visitors</span>: <span className="text-amber-300">342</span>,
                </p>
                <p className="ml-4">
                  <span className="text-blue-300">pageViews</span>: <span className="text-amber-300">1247</span>,
                </p>
                <p className="ml-4">
                  <span className="text-blue-300">avgTimeOnSite</span>:{" "}
                  <span className="text-emerald-300">'2m 34s'</span>,
                </p>
                <p className="ml-4">
                  <span className="text-blue-300">topReferrer</span>:{" "}
                  <span className="text-emerald-300">'twitter.com'</span>,
                </p>
                <p className="ml-4">
                  <span className="text-blue-300">trending</span>: [
                </p>
                <p className="ml-8">
                  <span className="text-emerald-300">'/how-i-built-SnipStats'</span>,
                </p>
                <p className="ml-8">
                  <span className="text-emerald-300">'/pricing'</span>,
                </p>
                <p className="ml-8">
                  <span className="text-emerald-300">'/about'</span>
                </p>
                <p className="ml-4">],</p>

                <p>{`}`};</p>
                <p className="text-pink-300 mt-2">// 🚀 Your traffic is up 23% from yesterday!</p>
              </div>
            </div>

            {/* Mini Chart Card */}
            <div className="absolute -bottom-10 -left-5 bg-white rounded-md shadow-md p-4 border border-[#383633]/10 w-56 z-20">
              <div className="text-xs font-semibold mb-2 flex justify-between items-center text-[#383633]">
                <span>This Week's Traffic</span>
                <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
              </div>
              <div className="flex items-end h-12 gap-0.5 mb-1">
                <div className="w-1/7 h-[40%] bg-teal-200 rounded-t-sm"></div>
                <div className="w-1/7 h-[35%] bg-teal-300 rounded-t-sm"></div>
                <div className="w-1/7 h-[50%] bg-teal-400 rounded-t-sm"></div>
                <div className="w-1/7 h-[30%] bg-teal-500 rounded-t-sm"></div>
                <div className="w-1/7 h-[70%] bg-teal-600 rounded-t-sm"></div>
                <div className="w-1/7 h-[60%] bg-teal-700 rounded-t-sm"></div>
                <div className="w-1/7 h-full bg-teal-800 rounded-t-sm relative">
                  <span className="absolute left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-[#383633]">
                    342
                  </span>
                </div>
              </div>
              <div className="text-[8px] text-[#383633]/60 flex justify-between">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-5 right-10 bg-white rounded-md shadow-md py-1.5 px-3 border border-[#383633]/10 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-[#383633]">New Record Day!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot Feature */}
      <section className=" mx-auto px-4 py-16 bg-muted/50 rounded-md my-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-md px-4 py-1">
                <Camera className="h-3.5 w-3.5 mr-1 text-blue-600" />
                New Feature
              </Badge>
              <h2 className="text-3xl font-bold mb-4 text-[#383633]">Share Your Wins in One Click</h2>
              <p className="text-xl text-[#383633]/80 mb-6">
                Hit a traffic milestone? Got a spike from that Twitter thread? Create beautiful, shareable screenshots
                of your stats to celebrate your wins.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Share2 className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <p className="text-[#383633]/80">Instantly create social-media ready images of your stats</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Download className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <p className="text-[#383633]/80">Download as PNG or copy directly to clipboard</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Copy className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <p className="text-[#383633]/80">Customizable templates to match your brand</p>
                </div>
              </div>
            </div>

            {/* Screenshot Mockup */}
            <div className="relative">
              <div className="bg-[#383633] rounded-md p-6 shadow-md max-w-md mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-xs text-white/70">SnipStats.app</div>
                    <div className="text-xl font-bold text-white">Weekly Report</div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#383633]">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs rounded-md p-4 mb-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs text-white/70">Total Visitors</div>
                      <div className="text-3xl font-bold text-white">3,842</div>
                      <div className="flex items-center text-emerald-300 text-xs mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+23.5% from last week</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-0.5 h-14">
                      <div className="w-1.5 h-[30%] bg-teal-200/50 rounded-t-sm"></div>
                      <div className="w-1.5 h-[40%] bg-teal-300/50 rounded-t-sm"></div>
                      <div className="w-1.5 h-[60%] bg-teal-400/50 rounded-t-sm"></div>
                      <div className="w-1.5 h-[45%] bg-teal-500/50 rounded-t-sm"></div>
                      <div className="w-1.5 h-[70%] bg-teal-600/50 rounded-t-sm"></div>
                      <div className="w-1.5 h-[85%] bg-teal-700/50 rounded-t-sm"></div>
                      <div className="w-1.5 h-full bg-teal-400 rounded-t-sm"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/10 backdrop-blur-xs rounded-md p-3">
                    <div className="text-xs text-white/70">Top Referrer</div>
                    <div className="flex items-center mt-1">
                      <Twitter className="h-4 w-4 text-blue-400 mr-1.5" />
                      <span className="text-white font-semibold">Twitter</span>
                    </div>
                    <div className="text-xs text-white/70 mt-2">1,248 visitors</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xs rounded-md p-3">
                    <div className="text-xs text-white/70">Top Page</div>
                    <div className="text-sm text-white font-semibold mt-1 truncate">/how-i-built-SnipStats</div>
                    <div className="text-xs text-white/70 mt-2">872 views</div>
                  </div>
                </div>

                <div className="text-xs text-white/70 text-center">
                  Generated with SnipStats •{" "}
                  {new Date().toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" })}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-md shadow-md p-2 border border-[#383633]/10">
                <Camera className="h-5 w-5 text-blue-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-md shadow-md py-1 px-3 text-xs flex items-center gap-1.5 border border-[#383633]/10">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-[#383633]">Share-worthy stats!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - UPDATED with new features */}
      <section className=" mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[#383633]">What you'll actually get</h2>
            <p className="text-xl text-[#383633]/80 max-w-2xl mx-auto">
              Just the answers you need, none of the features you don't.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-md border border-[#383633]/10 p-6 hover:border-[#383633]/30 transition-all group relative overflow-hidden">
              <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-all">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#383633]">Screenshot-Ready Stats</h3>
              <p className="text-[#383633]/80">
                Clean, chart-based UI made for screenshotting and sharing on social media.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 hover:border-[#383633]/30 transition-all group relative overflow-hidden">
              <div className="w-10 h-10 rounded-md bg-teal-100 flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-all">
                <div className="h-5 w-5 text-teal-600 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#383633]">Indie Timeline View</h3>
              <p className="text-[#383633]/80">A personal analytics dashboard that feels indie, not corporate.</p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 hover:border-[#383633]/30 transition-all group relative overflow-hidden">
              <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-all">
                <Activity className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#383633]">Active Timeline Events</h3>
              <p className="text-[#383633]/80">
                Automatically detect and highlight traffic spikes, drops, and growth streaks.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 hover:border-[#383633]/30 transition-all group relative overflow-hidden">
              <div className="w-10 h-10 rounded-md bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-all">
                <Code className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#383633]">No Code Installation</h3>
              <p className="text-[#383633]/80">
                Connect directly to Google Analytics - no need to add code to your site.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 hover:border-[#383633]/30 transition-all group relative overflow-hidden">
              <div className="w-10 h-10 rounded-md bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-all">
                <Lock className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#383633]">Privacy-Friendly</h3>
              <p className="text-[#383633]/80">
                We only store aggregated stats, never personal or identifiable information.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 hover:border-[#383633]/30 transition-all group relative overflow-hidden">
              <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-all">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#383633]">Complete Control on your data</h3>
              <p className="text-[#383633]/80">
                Everything stays in your hands—your data is never used without permission.
              </p>
              <Badge className="mt-2 bg-amber-100 text-amber-800 hover:bg-amber-200 px-2 py-0.5 text-xs rounded-md">
                <Sparkles className="h-3 w-3 mr-1 text-amber-600" />
                Maker Favorite
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics That Make Sense */}
      <section className=" mx-auto px-4 py-16 bg-muted/50 rounded-md my-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-[#383633]">Analytics that actually make sense</h2>
            <p className="text-xl text-[#383633]/80 max-w-2xl mx-auto">
              No more staring at 15 confusing charts trying to figure out what's happening.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-md shadow-xs overflow-hidden relative group hover:shadow-md transition-all duration-300 border border-[#383633]/10">
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-teal-600" />
                  <span className="font-medium text-[#383633]">Your Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-md">
                    <TrendingUp className="h-3 w-3 mr-1 text-emerald-600" />
                    Live
                  </Badge>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="bg-muted/50 rounded-md p-4 flex-1">
                    <div className="text-sm text-[#383633]/70 mb-1">Weekly Visitors</div>
                    <div className="text-3xl font-bold text-[#383633]">1,247</div>
                    <div className="flex items-center text-emerald-600 text-xs mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+18.3% from last week</span>
                    </div>
                    <div className="flex items-end h-10 gap-0.5 mt-3">
                      <div className="w-1/7 h-[40%] bg-teal-200 rounded-t-sm"></div>
                      <div className="w-1/7 h-[35%] bg-teal-300 rounded-t-sm"></div>
                      <div className="w-1/7 h-[50%] bg-teal-400 rounded-t-sm"></div>
                      <div className="w-1/7 h-[30%] bg-teal-500 rounded-t-sm"></div>
                      <div className="w-1/7 h-[70%] bg-teal-600 rounded-t-sm"></div>
                      <div className="w-1/7 h-[60%] bg-teal-700 rounded-t-sm"></div>
                      <div className="w-1/7 h-full bg-teal-800 rounded-t-sm"></div>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-md p-4 flex-1">
                    <div className="text-sm text-[#383633]/70 mb-1">Source Breakdown</div>
                    <div className="space-y-3 mt-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Twitter className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm text-[#383633]">Twitter</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 h-1.5 bg-[#383633]/10 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: "65%" }}></div>
                          </div>
                          <span className="text-sm font-medium text-[#383633]">65%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 text-emerald-500 mr-2" />
                          <span className="text-sm text-[#383633]">Google</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 h-1.5 bg-[#383633]/10 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "25%" }}></div>
                          </div>
                          <span className="text-sm font-medium text-[#383633]">25%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Linkedin className="h-4 w-4 text-blue-700 mr-2" />
                          <span className="text-sm text-[#383633]">LinkedIn</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 h-1.5 bg-[#383633]/10 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-blue-700 rounded-full" style={{ width: "10%" }}></div>
                          </div>
                          <span className="text-sm font-medium text-[#383633]">10%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-md p-4">
                  <div className="text-sm text-[#383633]/70 mb-3">Top Performing Content</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white rounded-md border border-[#383633]/10">
                      <div>
                        <div className="font-medium text-[#383633]">/how-i-built-my-saas-in-public</div>
                        <div className="text-xs text-[#383633]/60 mt-0.5">Posted 3 days ago</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-[#383633]/60">Views</div>
                          <div className="font-medium text-[#383633]">872</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-[#383633]/60">Avg. Time</div>
                          <div className="font-medium text-[#383633]">4:32</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-[#383633]/60">Bounce</div>
                          <div className="font-medium text-emerald-600">12%</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded-md border border-[#383633]/10">
                      <div>
                        <div className="font-medium text-[#383633]">/indie-maker-journey</div>
                        <div className="text-xs text-[#383633]/60 mt-0.5">Posted 1 week ago</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-[#383633]/60">Views</div>
                          <div className="font-medium text-[#383633]">654</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-[#383633]/60">Avg. Time</div>
                          <div className="font-medium text-[#383633]">3:18</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-[#383633]/60">Bounce</div>
                          <div className="font-medium text-emerald-600">18%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-md shadow-xs overflow-hidden border border-[#383633]/10 p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-medium text-[#383633] flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-amber-600" />
                    Key Insights
                  </div>
                  <Badge className="bg-[#383633]/10 text-[#383633] hover:bg-[#383633]/20 rounded-md">
                    Auto-generated
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-md border border-emerald-100">
                    <div className="flex items-center text-emerald-700 font-medium mb-1">
                      <TrendingUp className="h-4 w-4 mr-1.5" />
                      <span>Your Twitter strategy is working!</span>
                    </div>
                    <p className="text-sm text-emerald-600">
                      65% of your traffic comes from Twitter, a 23% increase from last month.
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-md border border-amber-100">
                    <div className="flex items-center text-amber-700 font-medium mb-1">
                      <Lightbulb className="h-4 w-4 mr-1.5" />
                      <span>Content opportunity</span>
                    </div>
                    <p className="text-sm text-amber-600">
                      People spend 2x more time on posts about your building process.
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md border border-[#383633]/10">
                    <div className="flex items-center text-[#383633] font-medium mb-1">
                      <Target className="h-4 w-4 mr-1.5 text-teal-600" />
                      <span>Next milestone</span>
                    </div>
                    <p className="text-sm text-[#383633]/80">
                      You're 153 visitors away from reaching 5,000 monthly visitors!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-md shadow-xs overflow-hidden border border-[#383633]/10 p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-medium text-[#383633] flex items-center">
                    <Camera className="h-4 w-4 mr-2 text-blue-600" />
                    Quick Share
                  </div>
                </div>
                <div className="p-4 border border-dashed border-[#383633]/30 rounded-md bg-muted/50 text-center">
                  <Camera className="h-10 w-10 mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-[#383633]/80 mb-3">
                    Create a beautiful screenshot of your stats with one click.
                  </p>
                  <Button className="bg-[#383633] hover:bg-[#383633]/90 w-full text-sm rounded-md">
                    <Camera className="h-3.5 w-3.5 mr-1.5" />
                    <span>Capture Stats</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Maker Note */}
      <section className="mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-md border border-[#383633]/10 p-8 md:p-10 relative overflow-hidden">
          <div className="mb-6 text-center">
            <Badge className="mb-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md px-3 py-0.5 mx-auto">
              <Bookmark className="h-3 w-3 mr-1 text-amber-500" />
              From the maker
            </Badge>
            <h2 className="text-2xl font-bold text-[#383633]">Why I built SnapStats</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-md bg-white border-2 border-[#383633]/10 shrink-0 overflow-hidden shadow-xs mx-auto md:mx-0">
              <Image
                src="/diverse-group-city.png"
                alt="Harvansh, Founder"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-medium mb-4 text-[#383633] leading-relaxed relative">
                <span className="absolute -left-6 top-0 text-3xl text-[#383633]/30">"</span>I got tired of opening
                Google Analytics just to be more confused than when I started.
                <span className="absolute -right-2 bottom-0 text-3xl text-[#383633]/30">"</span>
              </div>
              <div className="text-[#383633]/80 mb-4">
                After 4 years as an indie maker, I realized we don't need complicated dashboards. We need clarity about
                what's working and what's not.
              </div>
              <div className="text-[#383633]/80 mb-4">
                SnapStats gives you exactly that - no fluff, no learning curve. Just connect your Google Analytics, and
                get insights that actually make sense.
              </div>
              <div className="flex items-center gap-2 mt-6">
                <div className="font-medium text-[#383633]">— Harvansh</div>
                <div className="text-sm text-[#383633]/70">Maker of SnapStats</div>
                <a
                  href="https://twitter.com/harvansh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-[#383633]">The Analytics Problem</h2>
          <p className="text-xl text-center mb-12 text-[#383633]/80">
            You pour hours into writing. You hit publish.
            <br />
            Then what?
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-md border border-[#383633]/10 p-6 shadow-xs hover:border-[#383633]/30 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-md bg-rose-100 flex items-center justify-center mb-4 group-hover:bg-rose-200 transition-all">
                <X className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#383633]">No idea which content actually works</h3>
              <p className="text-[#383633]/80">
                You're writing into the void, with no clear way to see what resonates with your audience.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 shadow-xs hover:border-[#383633]/30 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-md bg-rose-100 flex items-center justify-center mb-4 group-hover:bg-rose-200 transition-all">
                <X className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#383633]">Analytics overwhelm is real</h3>
              <p className="text-[#383633]/80">
                Google Analytics feels like flying a space shuttle when all you need is a bike.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 shadow-xs hover:border-[#383633]/30 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-md bg-rose-100 flex items-center justify-center mb-4 group-hover:bg-rose-200 transition-all">
                <X className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#383633]">You're guessing what's working</h3>
              <p className="text-[#383633]/80">
                Your content strategy is based on hunches, not actual data you can understand at a glance.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 shadow-xs hover:border-[#383633]/30 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-md bg-rose-100 flex items-center justify-center mb-4 group-hover:bg-rose-200 transition-all">
                <X className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#383633]">Too much data, too little insight</h3>
              <p className="text-[#383633]/80">
                Most analytics tools give you endless data points without telling you what actually matters.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl font-medium mb-4 text-[#383633]">This is exactly what SnapStats solves.</p>
            <p className="text-xl text-teal-600 font-bold">You don't need more data. You need clarity.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto px-4 py-16 bg-muted/50 rounded-md my-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-md px-4 py-1">
              <Zap className="h-3.5 w-3.5 mr-1 text-teal-600" />
              Simple Setup
            </Badge>
            <h2 className="text-3xl font-bold mb-4 text-[#383633]">How SnapStats Works</h2>
            <p className="text-xl text-[#383633]/80 max-w-2xl mx-auto">
              No code required. Get set up in minutes, not days.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-teal-300 hidden md:block"></div>

            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-6 items-start relative">
                <div className="md:w-16 shrink-0 relative z-10">
                  <div className="w-12 h-12 rounded-md bg-teal-100 flex items-center justify-center border-4 border-white">
                    <span className="text-xl font-bold text-teal-600">1</span>
                  </div>
                </div>
                <div className="grow p-5 bg-white rounded-md shadow-xs border border-[#383633]/10 hover:border-[#383633]/30 transition-all">
                  <h3 className="text-xl font-bold mb-3 text-[#383633]">Connect Your Google Account</h3>
                  <p className="text-[#383633]/80 mb-4">
                    SnapStats uses your existing Google Analytics data - no need to add new tracking code to your site.
                  </p>

                  <div className="bg-teal-50 rounded-md p-3 border border-teal-100 flex items-center gap-3">
                    <Code className="h-5 w-5 text-teal-600" />
                    <span className="text-sm text-teal-700">Already using Google Analytics? You're halfway there!</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start relative">
                <div className="md:w-16 shrink-0 relative z-10">
                  <div className="w-12 h-12 rounded-md bg-teal-100 flex items-center justify-center border-4 border-white">
                    <span className="text-xl font-bold text-teal-600">2</span>
                  </div>
                </div>
                <div className="grow p-5 bg-white rounded-md shadow-xs border border-[#383633]/10 hover:border-[#383633]/30 transition-all">
                  <h3 className="text-xl font-bold mb-3 text-[#383633]">Choose What Matters To You</h3>
                  <p className="text-[#383633]/80 mb-4">
                    Select which metrics you care about most. We'll put those front and center.
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-teal-50 rounded-md border border-teal-100 text-center">
                      <Eye className="h-4 w-4 mx-auto mb-1 text-teal-600" />
                      <span className="text-xs text-teal-700">Visitors</span>
                    </div>
                    <div className="p-2 bg-teal-50 rounded-md border border-teal-100 text-center">
                      <FileText className="h-4 w-4 mx-auto mb-1 text-teal-600" />
                      <span className="text-xs text-teal-700">Content</span>
                    </div>
                    <div className="p-2 bg-teal-50 rounded-md border border-teal-100 text-center">
                      <Globe className="h-4 w-4 mx-auto mb-1 text-teal-600" />
                      <span className="text-xs text-teal-700">Sources</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start relative">
                <div className="md:w-16 shrink-0 relative z-10">
                  <div className="w-12 h-12 rounded-md bg-teal-100 flex items-center justify-center border-4 border-white">
                    <span className="text-xl font-bold text-teal-600">3</span>
                  </div>
                </div>
                <div className="grow p-5 bg-white rounded-md shadow-xs border border-[#383633]/10 hover:border-[#383633]/30 transition-all">
                  <h3 className="text-xl font-bold mb-3 text-[#383633]">Get Insights & Share Your Wins</h3>
                  <p className="text-[#383633]/80 mb-4">
                    See your data translated into actual insights. Plus, create shareable screenshots to celebrate with
                    your audience.
                  </p>

                  <div className="flex items-center justify-center p-3 bg-teal-50 rounded-md mt-2 border border-teal-100">
                    <Rocket className="h-5 w-5 text-teal-600 mr-2" />
                    <span className="text-sm font-medium text-teal-700">Ready to show off your stats in style</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Indie Makers */}
      <section className="mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md px-4 py-1">
              <Target className="h-3.5 w-3.5 mr-1 text-amber-500" />
              Built For You
            </Badge>
            <h2 className="text-3xl font-bold mb-4 text-[#383633]">Made for Indie Makers</h2>
            <p className="text-xl text-[#383633]/80 max-w-2xl mx-auto">
              Not for enterprises. Not for marketing teams. For you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-md border border-[#383633]/10 p-6 shadow-xs hover:border-[#383633]/30 transition-all group">
              <div className="w-12 h-12 rounded-md bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-all">
                <Lightbulb className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#383633]">For solo content creators</h3>
              <p className="text-[#383633]/80">
                Writers, bloggers, and newsletter authors who need to understand what content resonates, without the
                overwhelm.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 shadow-xs hover:border-[#383633]/30 transition-all group">
              <div className="w-12 h-12 rounded-md bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-all">
                <Zap className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#383633]">For bootstrapped founders</h3>
              <p className="text-[#383633]/80">
                SaaS creators and digital product makers who need to know which pages convert, without a marketing team.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 shadow-xs hover:border-[#383633]/30 transition-all group md:col-span-2">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-md bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-all">
                    <MousePointer className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-[#383633]">
                    For any maker who's tired of analytics overwhelm
                  </h3>
                  <p className="text-[#383633]/80">
                    If you've ever opened Google Analytics, stared at the 50+ menu options, and closed the tab in
                    frustration — SnapStats was built for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto px-4 py-16 md:py-20 bg-muted/50 rounded-md my-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#383633]">Simple Pricing</h2>
          <p className="text-xl text-[#383633]/80 mb-12 max-w-2xl mx-auto">
            Free to start. Paid only if it earns your trust.
          </p>

          <div className="bg-white rounded-md border border-[#383633]/10 shadow-xs overflow-hidden max-w-md mx-auto transition-all duration-300 hover:border-[#383633]/30 hover:shadow-md">
            <div className="p-8 border-b">
              <div className="text-2xl font-bold mb-2 text-[#383633]">Free to Start</div>
              <div className="text-4xl font-bold text-teal-600 mb-4">$0</div>
              <div className="text-[#383633]/80">Get started with the essentials and see if it works for you.</div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mr-2 shrink-0" />
                  <span className="text-[#383633]/80">Connect to Google Analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mr-2 shrink-0" />
                  <span className="text-[#383633]/80">See visitor trends</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mr-2 shrink-0" />
                  <span className="text-[#383633]/80">Track top content</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mr-2 shrink-0" />
                  <span className="text-[#383633]/80">Monitor traffic sources</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 mr-2 shrink-0" />
                  <span className="text-[#383633]/80">Create shareable screenshots</span>
                </li>
              </ul>
              <div className="mt-6">
                <Button asChild size="lg" className="w-full bg-[#383633] hover:bg-[#383633]/90 rounded-md group">
                  <Link href="/sign-up" className="flex items-center justify-center">
                    Start Free
                    <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#383633]">FAQ</h2>

          <div className="space-y-6">
            <div className="bg-white rounded-md border border-[#383633]/10 p-6 hover:border-[#383633]/30 transition-all">
              <h3 className="text-xl font-bold mb-2 text-[#383633]">Do I need Google Analytics?</h3>
              <p className="text-[#383633]/80">
                Yes, SnipStats connects to your existing Google Analytics account to surface insights in a more
                digestible way.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 hover:border-[#383633]/30 transition-all">
              <h3 className="text-xl font-bold mb-2 text-[#383633]">Will it slow down my site?</h3>
              <p className="text-[#383633]/80">
                Not at all! Since SnipStats reads data from your existing Google Analytics, there's no additional code
                needed on your website.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 hover:border-[#383633]/30 transition-all">
              <h3 className="text-xl font-bold mb-2 text-[#383633]">Can I add multiple websites?</h3>
              <p className="text-[#383633]/80">
                Yes, you can add multiple websites to your SnipStats dashboard, as long as they're connected to your
                Google Analytics account.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#383633]/10 p-6 hover:border-[#383633]/30 transition-all">
              <h3 className="text-xl font-bold mb-2 text-[#383633]">How do I create shareable screenshots?</h3>
              <p className="text-[#383633]/80">
                It's easy! On any dashboard, click the "Capture Stats" button to generate a beautiful image you can
                share on Twitter, LinkedIn, or save to your computer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/50 mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#383633]">Ready to Showcase Your Growth?</h2>
          <p className="text-xl text-[#383633]/80 max-w-2xl mx-auto mb-10">
            Sign up now and start creating beautiful analytics visualizations for your website.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-[#383633] hover:bg-[#383633]/90 rounded-md px-8 transition-all group"
            >
              <Link href="/sign-up" className="flex items-center">
                Get SnipStats
                <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>
            <span className="text-[#383633]/70 text-sm flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-teal-600" />
              <span>Free to start, connects in minutes</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
