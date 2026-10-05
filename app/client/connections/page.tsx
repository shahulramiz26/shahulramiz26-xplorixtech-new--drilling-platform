'use client'

import ConnectionsScreen from '../../components/connections'

/* The mine owner's side of the connection: his ID, the contractors he is linked to. */
export default function Page() {
  return <ConnectionsScreen viewer="owner" />
}
