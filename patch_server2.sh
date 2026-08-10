sed -i 's/success: false,/\/\/ success: false,/g' server.ts
sed -i 's/message: error.message || '\''Terjadi kesalahan saat membuat Google Spreadsheet.'\'',/\/\/ message: error.message || '\''Terjadi kesalahan saat membuat Google Spreadsheet.'\'',/g' server.ts
