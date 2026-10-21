sed -i -E 's/(<input[^>]*className="[^"]*")/\1 disabled={item.inactive}/g' components/LivretScolairePage.tsx
sed -i -E 's/(<textarea[^>]*className="[^"]*")/\1 disabled={item.inactive}/g' components/LivretScolairePage.tsx
