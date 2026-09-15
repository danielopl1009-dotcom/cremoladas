@echo off
cd c:\Users\dani\Documents\sistemas
git add -A
git commit -m "fix: add type columns to flavors and products tables in schema initialization"
git push
echo Deploy pushed! Make sure to run initDatabase.js on Render server.
pause
