import { FileText, Upload, Eye, Download, Send } from 'lucide-react'

interface TabDocumentsProps {
  eleve: any
}

const STATUT_DOCUMENT_COLORS = {
  SIGNE: 'text-[rgb(var(--success))]',
  VALIDE: 'text-[rgb(var(--success))]',
  GENERE: 'text-[rgb(var(--info))]',
  EN_ATTENTE: 'text-[rgb(var(--warning))]',
  RECU: 'text-[rgb(var(--info))]',
}

export function TabDocuments({ eleve }: TabDocumentsProps) {
  if (!eleve.documents || eleve.documents.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
            Documents de l'élève
          </h3>
          <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Ajouter un document
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-[rgb(var(--muted-foreground))]">Aucun document disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
          Documents de l'élève
        </h3>
        <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Ajouter un document
        </button>
      </div>

      {eleve.documents.map((doc: any, index: number) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText
              className={`w-5 h-5 ${
                STATUT_DOCUMENT_COLORS[doc.statut as keyof typeof STATUT_DOCUMENT_COLORS] ||
                'text-[rgb(var(--muted-foreground))]'
              }`}
            />
            <div>
              <p className="font-medium text-[rgb(var(--foreground))]">
                {doc.type.replace(/_/g, ' ')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs ${
                    STATUT_DOCUMENT_COLORS[doc.statut as keyof typeof STATUT_DOCUMENT_COLORS] ||
                    'text-[rgb(var(--muted-foreground))]'
                  }`}
                >
                  {doc.statut}
                </span>
                {doc.date && (
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">• {doc.date}</span>
                )}
                {doc.nom_fichier && (
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">
                    • {doc.nom_fichier}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {doc.statut !== 'EN_ATTENTE' ? (
              <>
                <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                  <Eye className="w-4 h-4 text-[rgb(var(--accent))]" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                  <Download className="w-4 h-4 text-[rgb(var(--accent))]" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                  <Send className="w-4 h-4 text-[rgb(var(--accent))]" />
                </button>
              </>
            ) : (
              <button className="px-3 py-1.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg text-sm font-medium hover:bg-[rgb(var(--accent-light))] transition-colors">
                Générer
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}