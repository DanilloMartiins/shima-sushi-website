@echo off
cd /d "C:\Users\Danillo Martins\OneDrive - eletrobras.com\Projetos - pessoais\Seu Shima Sushi\houseburgergrill-backend"
echo ========================================
echo Executando testes JUnit com Maven
echo ========================================
call mvnw.cmd clean test -DskipFailingTests=false 2>&1
pause