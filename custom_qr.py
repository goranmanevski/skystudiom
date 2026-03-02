import qrcode

# Твојот линк со UTM параметри
url = "https://www.skystudiom.mk/?utm_source=qr_code&utm_medium=business_card&utm_campaign=general_promo_2026&utm_id=Sky%20Studio%20M"

# Креирање на QR кодот
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H, # Висока корекција (подобро за печатење)
    box_size=10,
    border=4,
)
qr.add_data(url)
qr.make(fit=True)

# Креирање слика (црно-бела)
img = qr.make_image(fill_color="black", back_color="white")

# Снимање на фајлот
img.save("skystudiom_qr.png")
print("QR кодот е успешно генериран како skystudiom_qr.png")