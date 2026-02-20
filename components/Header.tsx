'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Header = () => {

	const pathname = usePathname();

	return (
		<header>
			<div className="main-container inner">
				<Link href="/">
					<Image src="/logo.svg" alt="CryptoStream logo" width={180} height={54} />
				</Link>

				<nav>
					<Link href="/" className={cn("nav-link", {
						"is-active": pathname === "/",
						"is-home": true
					})}>Home</Link>

					<button
						onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
						className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-100 bg-dark-500 hover:bg-dark-400 rounded-lg border border-white/5 transition-colors cursor-pointer pointer-events-auto"
						style={{ cursor: 'pointer' }}
					>
						<span className="pointer-events-none">Search coins...</span>
						<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-purple-100 opacity-100">
							<span className="text-xs">⌘</span>K
						</kbd>
					</button>

					<Link href="/coins" className={cn("nav-link", {
						"is-active": pathname === "/coins"
					})}>All Coins</Link>
				</nav>
			</div>
		</header>
	)
}

export default Header