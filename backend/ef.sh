export $(cat .env | xargs)
cd backend
dotnet tool restore
dotnet ef "$@"
