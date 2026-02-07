@echo off
echo === Demarrage de la base de donnees CRM ABJ ===
echo.

echo 1. Demarrage des conteneurs Docker...
docker-compose up -d

echo.
echo 2. Attente que PostgreSQL soit pret (10 secondes)...
timeout /t 10 /nobreak >nul

echo.
echo 3. Application du schema Prisma...
call npm run db:push

echo.
echo 4. Execution du seed (donnees de test)...
call npm run db:seed

echo.
echo === Base de donnees prete ! ===
echo.
echo Comptes de test:
echo - Admin: admin@abj.fr / ABJ2024!
echo - Formateur: formateur@abj.fr / ABJ2024!
echo - Eleve: eleve@abj.fr / ABJ2024!
echo.
pause