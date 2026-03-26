/**
 * Client MinIO singleton
 * Gère la connexion au stockage de fichiers MinIO
 */

import * as Minio from 'minio'

function createMinioClient(): Minio.Client {
  const endpointRaw = process.env.MINIO_ENDPOINT || 'localhost:9000'

  // Parser l'endpoint pour séparer host et port
  // Le client npm minio prend host et port séparément
  let endpointHost: string
  let endpointPort: number

  if (endpointRaw.includes(':')) {
    const parts = endpointRaw.split(':')
    endpointHost = parts[0]
    endpointPort = parseInt(parts[1], 10)
  } else {
    endpointHost = endpointRaw
    endpointPort = 9000
  }

  const useSSL = process.env.MINIO_USE_SSL === 'true'

  return new Minio.Client({
    endPoint: endpointHost,
    port: endpointPort,
    useSSL,
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
  })
}

// Singleton global (survit aux hot reloads en dev)
const globalForMinio = globalThis as unknown as { minioClient?: Minio.Client }

export const minioClient: Minio.Client =
  globalForMinio.minioClient ?? (globalForMinio.minioClient = createMinioClient())

export const MINIO_BUCKET = process.env.MINIO_BUCKET || 'abj-documents'

/**
 * Vérifie si un objet existe dans MinIO
 */
export async function minioObjectExists(bucket: string, key: string): Promise<boolean> {
  try {
    await minioClient.statObject(bucket, key)
    return true
  } catch {
    return false
  }
}

/**
 * Génère la clé MinIO pour un document candidat
 * Format : candidats/{NUMERO_DOSSIER}/documents-administratifs/{CODE_TYPE}-{NUMERO_DOSSIER}.{ext}
 */
export function genererCleMinioDocument(
  numeroDossier: string,
  typeDocument: string,
  extension: string
): string {
  const prefixMap: Record<string, string> = {
    CV: 'CV',
    LETTRE_MOTIVATION: 'LETTRE-MOTIVATION',
    PHOTO: 'PHOTO',
    DIPLOMES: 'DIPLOMES',
    PORTFOLIO: 'PORTFOLIO',
    PIECE_IDENTITE: 'CNI',
    CNI_RECTO: 'CNI-RECTO',
    CNI_VERSO: 'CNI-VERSO',
    JUSTIF_DOMICILE: 'JUSTIF-DOMICILE',
    RIB: 'RIB',
    DEVIS_SIGNE: 'DEVIS-SIGNE',
    CONTRAT_FORMATION: 'CONTRAT',
    ATTESTATION_ASSIDUITE: 'ATTESTATION-ASSIDUITE',
    ATTESTATION_FIN_FORMATION: 'ATTESTATION-FIN',
    BULLETIN_1: 'BULLETIN-1',
    BULLETIN_2: 'BULLETIN-2',
    BULLETIN_3: 'BULLETIN-3',
    DIPLOME_OBTENU: 'DIPLOME-OBTENU',
    REGLEMENT_INTERIEUR: 'REGLEMENT',
    ACCORD_OPCO: 'ACCORD-OPCO',
    ACCORD_CPF: 'ACCORD-CPF',
    ACCORD_POLE_EMPLOI: 'ACCORD-PE',
    CONVENTION_FORMATION: 'CONVENTION',
  }

  const prefix = prefixMap[typeDocument] || typeDocument
  const ext = extension.startsWith('.') ? extension : `.${extension}`
  return `candidats/${numeroDossier}/documents-administratifs/${prefix}-${numeroDossier}${ext}`
}
