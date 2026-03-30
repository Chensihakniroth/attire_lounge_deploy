import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, ArrowRight, User, TrendingUp, Package, ShoppingBag, Plus, Users, Activity, ShieldCheck, Calendar, Gift, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { BorderBeam } from "@/components/ui/border-beam"

const Hero195 = () => {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-white backdrop-blur-md">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-attire-accent animate-pulse"></span>
            Intelligence Dashboard v2.0
          </div>
          <h1 className="mb-6 max-w-4xl text-5xl font-serif text-white lg:text-7xl leading-tight">
            Elevating <span className="text-attire-accent">Elegance</span> with Data Precision
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-white/60">
            Monitor your atelier's performance with real-time analytics, client demographics, and automated workflow intelligence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-black hover:bg-attire-accent transition-colors">
              View Analytics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5">
              Documentation
            </Button>
          </div>
        </div>

        <div className="relative mt-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[500px] w-[500px] rounded-full bg-attire-accent/20 blur-[120px]"></div>
          </div>
          <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl">
             <BorderBeam size={250} duration={12} delay={9} />
             <CardHeader className="border-b border-white/5 p-8">
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle className="text-2xl font-serif text-white">Performance Matrix</CardTitle>
                   <CardDescription className="text-white/40">Real-time throughput and engagement metrics</CardDescription>
                 </div>
                 <div className="flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Efficiency</p>
                    <p className="text-4xl font-serif text-white">94.2%</p>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[94.2%] bg-attire-accent"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Sessions</p>
                    <p className="text-4xl font-serif text-white">12</p>
                    <div className="flex -space-x-2">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-[10px] text-white">
                          <User size={12} />
                        </div>
                      ))}
                      <div className="h-8 w-8 rounded-full border-2 border-black bg-attire-accent flex items-center justify-center text-[10px] text-black font-bold">
                        +7
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">System Status</p>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="text-green-500" size={24} />
                      <p className="text-xl font-medium text-white">Operational</p>
                    </div>
                    <p className="text-[10px] text-white/30">All systems functioning within normal parameters.</p>
                  </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 -z-10 h-full w-full">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]"></div>
      </div>
    </section>
  )
}

export { Hero195 }
