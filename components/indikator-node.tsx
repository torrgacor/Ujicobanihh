'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Cpu,
  HardDrive,
  Network,
  Globe,
  LockKeyhole,
} from 'lucide-react';

export default function KomponenStatistik() {
  const [publicRam, setPublicRam] = useState('0%');
  const [publicStorage, setPublicStorage] = useState('0%');

  const [privateRam, setPrivateRam] = useState('0%');
  const [privateStorage, setPrivateStorage] = useState('0%');

  const elemenRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          setPublicRam('61%');
          setPublicStorage('56.2%');

          setPrivateRam('39%');
          setPrivateStorage('56.2%');

          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (elemenRef.current) {
      observer.observe(elemenRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const ServerCard = ({
    type,
    ramWidth,
    storageWidth,
    ramUsage,
    storageUsage,
    network,
    ram,
    vcpu,
  }: {
    type: 'public' | 'private';
    ramWidth: string;
    storageWidth: string;
    ramUsage: string;
    storageUsage: string;
    network: string;
    ram: string;
    vcpu: string;
  }) => {
    const isPrivate = type === 'private';

    return (
      <div
        className={`
          w-full
          p-5 sm:p-6
          bg-[#050505]
          border
          ${isPrivate ? 'border-red-900/50' : 'border-zinc-800'}
          rounded-2xl
          text-white
          font-sans
          shadow-[0_0_30px_rgba(220,38,38,0.05)]
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-7">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1a0505] rounded-xl border border-red-900/50">
              {isPrivate ? (
                <LockKeyhole
                  className="w-5 h-5 text-red-500"
                  strokeWidth={1.5}
                />
              ) : (
                <Globe
                  className="w-5 h-5 text-red-500"
                  strokeWidth={1.5}
                />
              )}
            </div>

            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-white tracking-wide">
                INTEL XEON V4
              </h3>

              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />

                <span className="text-xs text-red-400 font-medium">
                  Server Indonesia
                </span>
              </div>
            </div>
          </div>

          <div
            className={`
              px-2.5 py-1.5
              rounded-md
              border
              ${
                isPrivate
                  ? 'bg-red-600/10 border-red-500/30'
                  : 'bg-[#111] border-zinc-800'
              }
            `}
          >
            <span
              className={`
                text-[10px]
                font-semibold
                tracking-wider
                ${
                  isPrivate
                    ? 'text-red-400'
                    : 'text-zinc-500'
                }
              `}
            >
              {isPrivate ? 'PRIVATE NODE' : 'PUBLIC NODE'}
            </span>
          </div>
        </div>

        {/* RAM */}
        <div className="space-y-5 mb-7">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest">
                RAM MEMORY
              </span>

              <span className="text-xs font-bold text-white">
                {ramUsage} / 64 GB
              </span>
            </div>

            <div className="w-full h-2 bg-[#111] rounded-full overflow-hidden border border-zinc-800/80">
              <div
                style={{ width: ramWidth }}
                className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out"
              />
            </div>
          </div>

          {/* Storage */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest">
                STORAGE ALLOCATION
              </span>

              <span className="text-xs font-bold text-white">
                {storageUsage} / 200 GB
              </span>
            </div>

            <div className="w-full h-2 bg-[#111] rounded-full overflow-hidden border border-zinc-800/80">
              <div
                style={{ width: storageWidth }}
                className="h-full bg-gradient-to-r from-red-800 to-red-400 rounded-full transition-all duration-1000 ease-out"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Network */}
          <div className="flex flex-col items-center justify-center p-3 bg-[#0a0a0a] rounded-xl border border-zinc-800/60">
            <Network
              className="w-5 h-5 text-red-500 mb-2"
              strokeWidth={1.5}
            />

            <span className="text-[8px] font-bold text-zinc-600 tracking-widest mb-1">
              NETWORK
            </span>

            <span className="text-xs font-bold text-white">
              {network}
            </span>
          </div>

          {/* RAM */}
          <div className="flex flex-col items-center justify-center p-3 bg-[#0a0a0a] rounded-xl border border-zinc-800/60">
            <HardDrive
              className="w-5 h-5 text-red-500 mb-2"
              strokeWidth={1.5}
            />

            <span className="text-[8px] font-bold text-zinc-600 tracking-widest mb-1">
              RAM
            </span>

            <span className="text-xs font-bold text-white">
              {ram}
            </span>
          </div>

          {/* VCPU */}
          <div className="flex flex-col items-center justify-center p-3 bg-[#0a0a0a] rounded-xl border border-zinc-800/60">
            <Cpu
              className="w-5 h-5 text-red-500 mb-2"
              strokeWidth={1.5}
            />

            <span className="text-[8px] font-bold text-zinc-600 tracking-widest mb-1">
              VCPU
            </span>

            <span className="text-xs font-bold text-white">
              {vcpu}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={elemenRef}
      className="w-full max-w-5xl mx-auto px-4 py-6"
    >
      {/* Judul */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Pilih Spesifikasi Server
        </h2>

        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Pilih Public Node atau Private Node sesuai kebutuhan
        </p>
      </div>

      {/* 2 Tabel Berdampingan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PUBLIC */}
        <ServerCard
          type="public"
          ramWidth={publicRam}
          storageWidth={publicStorage}
          ramUsage="39.04 GB"
          storageUsage="112.4 GB"
          network="900 Mbps"
          ram="64 GB"
          vcpu="16 CORE"
        />

        {/* PRIVATE */}
        <ServerCard
          type="private"
          ramWidth={privateRam}
          storageWidth={privateStorage}
          ramUsage="24.96 GB"
          storageUsage="112.4 GB"
          network="1 Gbps"
          ram="16 GB"
          vcpu="8 CORE"
        />
      </div>
    </div>
  );
}