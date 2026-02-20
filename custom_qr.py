import qrcode
from PIL import Image

# 1. Основни податоци
url = "https://skystudiom.com"
logo_path = "logo.png"
# Го сменивме името на фајлот за да знаеме дека е dark верзија
output_name = "SkyStudioM_Dark_QR.png"

# 2. Подесување на QR кодот (High correction за да трпи лого)
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)
qr.add_data(url)
qr.make(fit=True)

# === ГЛАВНАТА ПРОМЕНА Е ТУКА ===
# fill_color = бојата на точките (ја ставаме бела)
# back_color = бојата на позадината (ја ставаме црна)
img = qr.make_image(fill_color="white", back_color="black").convert('RGBA')

# 3. Додавање на логото
try:
    # Важно: Логото треба да биде PNG со транспарентност за најдобар ефект
    logo = Image.open(logo_path).convert('RGBA')
    
    # Пресметка на големината (50% од QR кодот)
    box_width, box_height = img.size
    logo_size = int(box_width * 0.5)
    logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Центрирање
    pos = ((box_width - logo_size) // 2, (box_height - logo_size) // 2)
    
    # Лепење на логото (користиме маска за транспарентност ако логото е PNG)
    img.paste(logo, pos, logo)
    print("Логото е успешно вметнато во средината!")

except FileNotFoundError:
    print(f"Внимание: Фајлот '{logo_path}' не е пронајден. Генериран е само QR кодот.")
except Exception as e:
    print(f"Настана грешка со логото: {e}")

# 4. Снимање на крајниот резултат
img.save(output_name)
print(f"Готово! Твојот нов 'Dark Mode' QR код е зачуван како: {output_name}")