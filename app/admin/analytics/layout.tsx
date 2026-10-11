export const metadata = {
  title: 'Analytics - XPLORIX',
}

/* No background of its own: the analytics screens sit on the same surface as
 * every other admin screen. */
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
