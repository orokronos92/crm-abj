import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const idFormateur = formData.get('idFormateur') as string
    const codeTypeDocument = formData.get('codeTypeDocument') as string
    const libelle = formData.get('libelle') as string

    if (!file || !idFormateur || !codeTypeDocument) {
      return NextResponse.json(
        { error: 'Fichier, ID formateur et type de document requis' },
        { status: 400 }
      )
    }

    // Vérifier que le formateur existe
    const formateur = await prisma.formateur.findUnique({
      where: { idFormateur: parseInt(idFormateur) }
    })

    if (!formateur) {
      return NextResponse.json(
        { error: 'Formateur non trouvé' },
        { status: 404 }
      )
    }

    // Créer le dossier uploads si nécessaire
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'formateurs', idFormateur)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${codeTypeDocument}_${timestamp}.${extension}`
    const filePath = join(uploadsDir, fileName)

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL publique du fichier
    const urlFichier = `/uploads/formateurs/${idFormateur}/${fileName}`

    // Vérifier si un document existe déjà pour ce type
    const existingDoc = await prisma.documentFormateur.findFirst({
      where: {
        idFormateur: parseInt(idFormateur),
        codeTypeDocument: codeTypeDocument
      }
    })

    if (existingDoc) {
      // Mettre à jour le document existant
      await prisma.documentFormateur.update({
        where: { idDocument: existingDoc.idDocument },
        data: {
          urlFichier,
          nomFichier: file.name,
          taileFichier: file.size,
          dateDocument: new Date(),
          statut: 'EN_ATTENTE',
          modifieLe: new Date()
        }
      })
    } else {
      // Créer un nouveau document
      await prisma.documentFormateur.create({
        data: {
          idFormateur: parseInt(idFormateur),
          codeTypeDocument,
          libelle,
          urlFichier,
          nomFichier: file.name,
          taileFichier: file.size,
          dateDocument: new Date(),
          statut: 'EN_ATTENTE',
          creeLe: new Date(),
          modifieLe: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploadé avec succès',
      urlFichier
    })
  } catch (error) {
    console.error('Erreur upload document:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du document' },
      { status: 500 }
    )
  }
}
