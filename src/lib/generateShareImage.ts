export async function generateShareImage(
  score: number,
  questionResults: boolean[],
  mode?: "daily" | "pawsistence"
) {
  // Load both regular and bold Poppins
  await document.fonts.load('700 120px "Poppins"');
  await document.fonts.load('400 48px "Poppins"');
  await document.fonts.load('600 48px "Poppins"');
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Set Instagram Story dimensions (9:16)
  canvas.width = 1080;
  canvas.height = 1920;
  
  // Create dark background with gradient (removing green tint)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#121213');    // Very dark gray
  gradient.addColorStop(1, '#1a1a1b');    // Slightly lighter dark gray
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i < canvas.height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Text settings
  ctx.textAlign = 'center';
  
  // Draw title with dog emoji
  ctx.font = 'bold 120px "Poppins"';
  ctx.fillStyle = '#ffffff';
  const titleText = 'Barkle';
  const titleWidth = ctx.measureText(titleText).width;
  const titleX = canvas.width/2;
  ctx.fillText(titleText, titleX, 250);
  
  // Add dog emoji
  ctx.font = '80px Arial';
  ctx.fillText('🐕', titleX + titleWidth/2 + 60, 240);
  
  // Draw subtitle
  ctx.font = '48px "Poppins"';
  ctx.fillStyle = '#64748b';  // slate-500
  ctx.fillText(mode === "pawsistence" ? "My Pawsistence" : "My Daily Barkle", canvas.width/2, 320);
  
  // Draw date
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  ctx.font = '36px "Poppins"';
  ctx.fillStyle = '#475569';  // slate-600
  ctx.fillText(date, canvas.width/2, 370);

  // Draw score
  if (mode === "pawsistence") {
    ctx.font = 'bold 280px "Poppins"';
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`${score}`, canvas.width/2 - 60, canvas.height/2 - 60);
    
    ctx.font = '200px Arial';
    ctx.fillText('🐕', canvas.width/2 + 120, canvas.height/2 - 60);
    
    ctx.font = 'bold 64px "Poppins"';
    ctx.fillStyle = '#64748b';
    ctx.fillText("Best Streak", canvas.width/2, canvas.height/2 + 60);
  } else {
    // Make the score number even larger
    ctx.font = 'bold 280px "Poppins"';
    ctx.fillStyle = '#4ade80';
    ctx.fillText(score.toString(), canvas.width/2 - 50, canvas.height/2 - 100);
    
    // Adjust "/5" size proportionally
    ctx.font = 'bold 160px "Poppins"';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('/5', canvas.width/2 + 120, canvas.height/2 - 100);
    
    // Make "Correct" text smaller
    ctx.font = 'bold 48px "Poppins"';
    ctx.fillStyle = '#64748b';
    ctx.fillText("Correct", canvas.width/2, canvas.height/2);
  }
  
  // Draw result squares
  if (mode !== "pawsistence") {
    const squareSize = 120;
    const gap = 24;
    const totalWidth = (squareSize * 5) + (gap * 4);
    const startX = (canvas.width - totalWidth) / 2;
    
    questionResults.forEach((result, i) => {
      const x = startX + (i * (squareSize + gap));
      const y = canvas.height/2 + 150;
      
      // Draw rounded rectangle
      ctx.fillStyle = result ? '#22c55e' : '#ef4444';
      const radius = 20;
      ctx.beginPath();
      ctx.roundRect(x, y, squareSize, squareSize, radius);
      ctx.fill();
      
      // Make paw prints bigger too
      ctx.font = '56px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🐾', x + squareSize/2, y + squareSize/2 + 8);
    });
  }
  
  // Draw footer text
  ctx.font = '36px "Poppins"';
  ctx.fillStyle = '#64748b';  // slate-500
  ctx.fillText('Fetch your own pups at', canvas.width/2, canvas.height - 140);
  ctx.font = 'bold 48px "Poppins"';
  ctx.fillStyle = '#4ade80';  // emerald-400
  ctx.fillText('barkle.vercel.app', canvas.width/2, canvas.height - 80);
  
  return canvas.toDataURL('image/png');
}
