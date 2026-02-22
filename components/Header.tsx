'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

const Header = () => {

	const pathname = usePathname();
	const [isMac, setIsMac] = useState(false);

	useEffect(() => {
		const nav = navigator as Navigator & { userAgentData?: { platform: string } };
		const platform = nav.userAgentData?.platform || navigator.platform || navigator.userAgent;
		const isApple = /Mac|iPhone|iPad/i.test(platform);
		if (isApple !== isMac) {
			setTimeout(() => setIsMac(isApple), 0);
		}
	}, [isMac]);

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Close mobile menu when route changes
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsMobileMenuOpen(false);
	}, [pathname]);

	// Prevent scrolling when mobile menu is open
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isMobileMenuOpen]);

	return (
		<header>
			<div className="main-container inner relative flex justify-between items-center h-full">
				<Link href="/" className="z-50 relative">
					<Image src="/logo.svg" alt="CryptoStream logo" width={180} height={54} />
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex h-full items-center gap-2">
					<Link href="/" className={cn("nav-link", {
						"is-active": pathname === "/",
					})}>Home</Link>

					<button
						onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-100 bg-dark-500 hover:bg-dark-400 rounded-lg border border-white/5 transition-colors cursor-pointer pointer-events-auto mx-4"
					>
						<span className="pointer-events-none">Search coins...</span>
						<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-purple-100 opacity-100">
							<span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
						</kbd>
					</button>

					<Link href="/coins" className={cn("nav-link", {
						"is-active": pathname === "/coins"
					})}>All Coins</Link>

					<Link href="/portfolio" className={cn("nav-link", {
						"is-active": pathname === "/portfolio"
					})}>Portfolio</Link>
				</nav>

				{/* Mobile Menu Toggle Button */}
				<button
					className="md:hidden z-50 p-2 text-purple-100 hover:text-white transition-colors relative"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					aria-label="Toggle mobile menu"
				>
					{isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
				</button>

				{/* Mobile Navigation Overlay */}
				{isMobileMenuOpen && (
					<div className="md:hidden fixed inset-0 z-40 bg-dark-700/95 backdrop-blur-md pt-24 px-6 pb-6 flex flex-col gap-6 h-[100dvh]">
						<button
							onClick={() => {
								setIsMobileMenuOpen(false);
								document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
							}}
							className="flex items-center justify-between w-full px-4 py-4 text-base font-medium text-purple-100 bg-dark-500 hover:bg-dark-400 rounded-xl border border-white/5 transition-colors cursor-pointer"
						>
							<span>Search coins...</span>
						</button>

						<div className="flex flex-col gap-2">
							<Link href="/" className={cn("px-4 py-4 rounded-xl text-lg font-medium transition-colors hover:bg-dark-500", {
								"text-white bg-dark-500 border border-white/5": pathname === "/",
								"text-purple-100": pathname !== "/"
							})}>Home</Link>

							<Link href="/coins" className={cn("px-4 py-4 rounded-xl text-lg font-medium transition-colors hover:bg-dark-500", {
								"text-white bg-dark-500 border border-white/5": pathname === "/coins",
								"text-purple-100": pathname !== "/coins"
							})}>All Coins</Link>

							<Link href="/portfolio" className={cn("px-4 py-4 rounded-xl text-lg font-medium transition-colors hover:bg-dark-500", {
								"text-white bg-dark-500 border border-white/5": pathname === "/portfolio",
								"text-purple-100": pathname !== "/portfolio"
							})}>Portfolio</Link>
						</div>
					</div>
				)}
			</div>
		</header>
	)
}

export default Header