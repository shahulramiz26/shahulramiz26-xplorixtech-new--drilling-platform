'use client'

import ConnectionsScreen from '../../components/connections'

/* The contractor's side of the connection: his ID, the mine owners he is linked to. */
export default function Page() {
  return <ConnectionsScreen viewer="contractor" />
}
