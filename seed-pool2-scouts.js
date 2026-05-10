// ============================================================
// POOL #2 SCOUT CARD SEEDER — Cadet MF, Precision 2026
// Raedyn Tsui — Strip A2
//
// HOW TO USE:
//   1. Open https://aifenceguy.github.io/en-garde-tsui/
//   2. Log in, select RAEDYN profile
//   3. Open browser DevTools (F12 or Cmd+Opt+I)
//   4. Paste this entire script into the Console tab
//   5. Press Enter — watch for green "✓" confirmations
//
// This script uses the app's own Supabase client (already
// authenticated) so RLS passes automatically.
// ============================================================

(async function seedPool2() {
  'use strict';

  // ── Grab the live Supabase client from the app ──
  var supa;
  try {
    var mod = await import('./js/lib/supa.js');
    supa = mod.supa;
  } catch (e) {
    // Fallback: try window global or re-create
    try {
      var cfg = await import('./js/lib/config.js');
      var sb  = await import('https://esm.sh/@supabase/supabase-js@2.45.4');
      supa = sb.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    } catch (e2) {
      console.error('Could not load Supabase client:', e2);
      return;
    }
  }

  // ── Find Raedyn's profile ──
  var profileRes = await supa.from('profiles').select('id, name, role').eq('role', 'raedyn').limit(1);
  if (profileRes.error || !profileRes.data || !profileRes.data.length) {
    // Try matching by name
    profileRes = await supa.from('profiles').select('id, name, role').ilike('name', '%raedyn%').limit(1);
  }
  if (!profileRes.data || !profileRes.data.length) {
    console.error('❌ Could not find Raedyn profile. Make sure you are logged in and Raedyn profile exists.');
    return;
  }
  var profileId = profileRes.data[0].id;
  console.log('✓ Found Raedyn profile:', profileRes.data[0].name, '(', profileId, ')');

  // ── Pool #2 opponents ──
  // Ratings: looked up from FoilIQ intel DB + FencingTracker where available
  // Hand defaults to R (right) unless known otherwise
  var opponents = [
    {
      name:         'JIN Yucheng',
      club:         'LAIFC / Southern California',
      rating:       'U',
      hand:         'right',
      age_category: 'Cadet',
      notes:        'Unrated but FoilIQ strength 2009 — very dangerous. Active LAIFC competitor.'
    },
    {
      name:         'LEE Christopher',
      club:         'EIFC / San Diego',
      rating:       'U',
      hand:         'right',
      age_category: 'Cadet',
      notes:        'Elite International FC, San Diego. Verify rating on FT.'
    },
    {
      name:         'CHANG Jonathan',
      club:         'SILICONVLYFC / Central California',
      rating:       'U',
      hand:         'right',
      age_category: 'Cadet',
      notes:        'Silicon Valley Fencing Center. Verify rating on FT.'
    },
    {
      name:         'ZHANG Jason',
      club:         'LAIFC / Southern California',
      rating:       'U',
      hand:         'right',
      age_category: 'Cadet',
      notes:        'LAIFC teammate of Jin. Verify rating on FT.'
    },
    {
      name:         'AHN Theodore',
      club:         'DAVISFA / Mountain Valley',
      rating:       'U',
      hand:         'right',
      age_category: 'Cadet',
      notes:        'Davis Fencing Academy. Verify rating on FT.'
    },
    {
      name:         'ZHANG Andrew',
      club:         'BAFC / Northern California',
      rating:       'U',
      hand:         'right',
      age_category: 'Cadet',
      notes:        'Bay Area Fencing Club. Verify rating on FT.'
    }
  ];

  // ── Check existing + insert new ──
  var created = 0;
  var updated = 0;
  var skipped = 0;

  for (var i = 0; i < opponents.length; i++) {
    var opp = opponents[i];
    console.log('Processing ' + (i+1) + '/6: ' + opp.name + '...');

    // Check if already exists (case-insensitive match on name)
    var existing = await supa
      .from('opponents')
      .select('id, name, rating, club')
      .eq('profile_id', profileId)
      .ilike('name', opp.name)
      .limit(1);

    if (existing.data && existing.data.length > 0) {
      var ex = existing.data[0];
      // Check if rating needs updating
      if (opp.rating && opp.rating !== 'U' && ex.rating !== opp.rating) {
        var upd = await supa
          .from('opponents')
          .update({ rating: opp.rating, club: opp.club })
          .eq('id', ex.id);
        if (upd.error) {
          console.warn('⚠ Update failed for ' + opp.name + ':', upd.error.message);
        } else {
          console.log('↻ Updated rating for ' + opp.name + ': ' + ex.rating + ' → ' + opp.rating);
          updated++;
        }
      } else {
        console.log('→ Already exists: ' + opp.name + ' (rating: ' + (ex.rating || 'U') + ')');
        skipped++;
      }
      continue;
    }

    // Insert new opponent
    var ins = await supa
      .from('opponents')
      .insert({
        profile_id:   profileId,
        name:         opp.name,
        club:         opp.club,
        rating:       opp.rating || null,
        hand:         opp.hand || 'unknown',
        age_category: opp.age_category || null,
        archetypes:   [],
        is_priority_target: false
      })
      .select()
      .single();

    if (ins.error) {
      console.error('❌ Insert failed for ' + opp.name + ':', ins.error.message);
    } else {
      console.log('✓ Created scout card: ' + opp.name + ' (' + opp.rating + ', ' + opp.club + ')');
      created++;
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('POOL #2 SEED COMPLETE');
  console.log('  Created: ' + created);
  console.log('  Updated: ' + updated);
  console.log('  Already existed: ' + skipped);
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('Next: Go to #opponents to see all 6 cards.');
  console.log('After each bout, fill in SWOT + archetype live.');
})();
