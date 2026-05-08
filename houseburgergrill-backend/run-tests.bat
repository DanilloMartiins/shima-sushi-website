@echo off
echo ========================================
echo Executando testes JUnit com Maven
echo ========================================
call mvnw.cmd clean test -DskipFailingTests=false 2>&1
pause
