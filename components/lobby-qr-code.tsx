"use client"

import { QRCodeSVG } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface LobbyQRCodeProps {
  lobbyId: string
}

export function LobbyQRCode({ lobbyId }: LobbyQRCodeProps) {
  const { t } = useLanguage()
  const lobbyUrl = typeof window !== "undefined" ? `${window.location.origin}/game/lobby/${lobbyId}?join=true` : ""

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-10 sm:h-12 flex-1 sm:flex-none bg-transparent">
          <QrCode className="w-4 h-4" />
          {t("room.qrCode")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("room.qrCodeTitle")}</DialogTitle>
          <DialogDescription>{t("room.qrCodeDescription")}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-6 bg-white rounded-lg">
          <QRCodeSVG value={lobbyUrl} size={256} level="H" includeMargin />
        </div>
        <p className="text-xs text-center text-muted-foreground">{t("room.qrCodeHint")}</p>
      </DialogContent>
    </Dialog>
  )
}
