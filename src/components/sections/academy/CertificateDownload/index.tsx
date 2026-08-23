interface CertificateDownloadProps {
  children?: React.ReactNode
  className?: string
}

export function CertificateDownload({ children, className }: CertificateDownloadProps) {
  return <div className={className}>{children}</div>
}
