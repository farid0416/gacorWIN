
        let balance = localStorage.getItem('balance') || 1000;
        document.getElementById('balance').innerText = balance;
        const symbols = ['🍒', '🔔', '💎', '7️⃣', '🍇'];
        let spinSound = new Audio('https://www.myinstants.com/media/sounds/slot-machine.mp3');
        let winSound = new Audio('https://www.myinstants.com/media/sounds/cash.mp3');

        function spin() {
            if (balance < 10) return alert('Saldo tidak cukup!');
            balance -= 10;
            localStorage.setItem('balance', balance);
            document.getElementById('balance').innerText = balance;
            spinSound.play();

            for (let i = 1; i <= 3; i++) {
                setTimeout(() => {
                    let symbol = symbols[Math.floor(Math.random() * symbols.length)];
                    document.getElementById('reel' + i).innerHTML = '<div class="symbol">' + symbol + '</div>';
                }, i * 500);
            }

            setTimeout(() => checkWin(), 2000);
        }

        function checkWin() {
            let s1 = document.getElementById('reel1').innerText;
            let s2 = document.getElementById('reel2').innerText;
            let s3 = document.getElementById('reel3').innerText;

            if (s1 === s2 && s2 === s3) {
                balance += 100;
                localStorage.setItem('balance', balance);
                document.getElementById('balance').innerText = balance;
                winSound.play();
                document.getElementById('reel1').classList.add('glow');
                document.getElementById('reel2').classList.add('glow');
                document.getElementById('reel3').classList.add('glow');
            }
        }
    