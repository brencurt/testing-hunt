# testing-hunt
cumpleaños de luli

# explicación general
first i need to create the general concept which will be something like:
there will be some location points around Berlin, in each one there will be a qr code or similar. when you read the  code from the app it will show a picture of the next location, but the picture will be very zoomed in... so if you don't recognise the location you will have an option something like "do you need to zoom out? answer this question: 'some question'", if the answer is correct then it will zoom out... you can do it the necessary times in order to get the whole picture to recognise the place. so you will travel  to that place and you will find the next qr code. this will happen around 10 times. 
i am thinking that some of the qr codes could be also a phone call to someone who is in your contacts, a friend who will tell you where is the next clue. 

# explicación más ordenada IA
The Core Loop
+ Player opens the app → sees Stop #1's clue (a heavily zoomed-in photo of a Berlin location)
+ They go to that location → find a QR code hidden there
+ They scan it → the app unlocks Stop #2's clue
+ Repeat ~10 times → final stop = the birthday surprise (dinner, friends, a gift, whatever you plan)

The Zoom-Out Mechanic
Each location clue works like this:
+ Photo starts very zoomed in (almost abstract)
+ Player can tap "Zoom Out" — but first they must answer a trivia or personal question
+ Answer correctly → photo zooms out one level
+ They can do this as many times as needed — no penalty, just pride

This is the heart of the game — the zoom-out feels earned, not just given.

The Phone Call Twist
At 2 or 3 stops (not all — keep it special), instead of a photo clue, the app shows:
"Call someone who knows you well…" → taps a button → calls a friend directly
That friend has been briefed in advance and will give a verbal clue, tell a story, or just make the birthday person laugh. This is the most personal touch in the whole experience.

**** MIRAR LA PARTE DE AGREGAR

# qué necesito - logistica:

- pensar en 10 lugares significativos para Luli en Berlín - done
- buscar fotos de cada lugar - done 
- crear los código QR con las fotos de esos lugares: en esta pagina se pueden subir templates para hacer los codigos qr https://qrart.app/
- pensar preguntas, alrededor de 40 para que ella vaya desbloqueando en cada pista el zoom out. Serian 4 por imagen
- pensar en el texto de la presentación y el regalo final
- pensar a quién puede llamar para que le diga dónde está la próxima pista: acá estaria bueno que no tenga agendada a la persona y que tenga que adivinar a quién está llamando y si no sabe  tiene que ir haciendo preguntas para saber quién habla

-   # Lugares en orden:
-     1. Schmittz bar https://maps.app.goo.gl/GJmgLyD5SK85Ph3G9
-     2. Zosch bar https://maps.app.goo.gl/HnTCKASPmu8TPMaQ7
-     3. Monbijou Park https://maps.app.goo.gl/w6PdQbJC3KNefJgB8
-     4. Domo https://maps.app.goo.gl/9FJ1sfhv6YkLSSsm9
-     5. Unter den linden U station https://maps.app.goo.gl/vAgXMBGm1jHtdMJp8
-     6. Nefis https://maps.app.goo.gl/PJWB1anV6CSuf67j9
-     7. Späti https://maps.app.goo.gl/sseP5PgiZiCxv5Sw9
-     8. Muro de Berlin https://maps.app.goo.gl/eNZafKkYXPGuT1aY7
-     9. Tv Tower https://maps.app.goo.gl/wDV9439s3dZZQCPL6
-     10. Wadzeckstrasse o Casa https://maps.app.goo.gl/JKspwuTC2Z5dLbio8
- 

# AGREGAR ****

- Ya que va a ser una foto general del lugar la idea seria agregar una descripcion, cuando acierte dónde es, sobre donde exactamente puede buscar el codigo qr.
- Agregar una caja de texto donde ella escriba el nombre del lugar, por ejemplo "tv tower" y si es correcto que aparezca una descripcion de dónde buscar exactamente el codigo qr. De esta manera si logra decifrar la imagen al segundo intento, es decir al segundo zoom out ella en cualquier momento puede escribir el nombre del lugrar sin necesidad de usar los 4 zoom out...
- Cuando llega al lugar si no se da cuenta donde esta el codigo QR, puede responder otra pregunta y darle una pista de donde buscar
- Averiguar como guardar en cache la sesion si pasa mucho tiempo inactiva
- puedo usar digitalOcean para subir mis imagenes y que tengan una URL para luego poder crear el codigo qr con qrart.app con esa url ??

