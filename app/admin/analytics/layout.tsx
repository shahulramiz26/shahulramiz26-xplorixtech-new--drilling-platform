export const metadata = {
  title: 'Analytics - XPLORIX',
}

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      {children}
    </div>
  )
}
