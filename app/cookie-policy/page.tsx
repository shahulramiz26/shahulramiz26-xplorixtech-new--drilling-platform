'use client' import LegalLayout from '../components/LegalLayout' const H2 = ({c}:{c:string}) => ( 
{c}
) const P = ({c}:{c:string}) => ( 
{c}
) const B = ({c}:{c:string}) => ( 
{c}
) const Ul = ({items}:{items:string[]}) => ( 
{items.map((t,i)=>( 
•	{t}
))} 
) const Table = ({rows}:{rows:[string,string,string][]}) => ( 
{['Cookie Name','Purpose','Duration'].map(h=>( 
{h}
))} {rows.map((row,i)=>( 
{row.map((cell,j)=>( 
{cell}
))} ))} 
) export default function CookiePolicy() { return ( 
) } 



