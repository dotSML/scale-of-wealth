#!/usr/bin/env python3
"""Check the dated data against the static page and its proportional artwork."""
from pathlib import Path
from html import unescape
from html.parser import HTMLParser
import json
import math
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'data/snapshot-2026-09-06.json').read_text())
W, I, P, S = (DATA[key] for key in ('wealth', 'income', 'population', 'spending'))
CSS = (ROOT / 'public/main.css').read_text()
HTML = (ROOT / 'public/index.html').read_text()
NS = {'s': 'http://www.w3.org/2000/svg'}
checks = 0


def close(actual, expected, description, tolerance=0.02):
    global checks
    assert math.isclose(actual, expected, rel_tol=1e-6, abs_tol=tolerance), (description, actual, expected)
    checks += 1


def dimensions(selector):
    rule = re.search(re.escape(selector) + r'\s*\{([^}]+)\}', CSS).group(1)
    return [float(re.search(r'\b' + prop + r':\s*([\d.]+)px', rule).group(1)) for prop in ('width', 'height')]


areas = {
    '.median .wealth': I['median_household_2024'],
    '.million .wealth': 1_000_000,
    '.billion .wealth': 1_000_000_000,
    '.bezos .wealth': W['musk'],
    '.four-hundred .wealth': W['forbes_400'],
    '.lifetime .square': I['median_worker_2025'] * I['illustrative_working_years'],
    '.healthcare .square': I['family_insurance_premium_2025'],
    '.amazon-year .square': I['amazon_hourly_benchmark'] * I['hours_per_week'] * I['weeks_per_year'],
    '.year-veteran .square': P['veterans_homeless_2025'] * S['illustrative_veteran_annual_grant'],
    '.year-chemo .square': S['nci_2026'],
    '.beyonce .square': W['beyonce'],
    '.goldman .square': I['solomon_compensation_2025'],
    '.tim-cook .square': W['tim_cook'],
    '.doctor .square': I['physician_2025'] * I['illustrative_working_years'],
    '.lawyer .square': I['lawyer_2025'] * I['illustrative_working_years'],
    '.hedgefund .square': 100_000_000,
}
for selector, dollars in areas.items():
    close(math.prod(dimensions(selector)) * DATA['dollars_per_square_pixel'], dollars, selector)

under_five = P['malaria_deaths_africa_2024'] * P['malaria_africa_under5_share']
for selector, deaths in [('.corona-bar .square', P['malaria_deaths_global_2024']), ('.malaria-bar .square', under_five), ('.ebola-bar .square', P['measles_deaths_global_2024'])]:
    close(math.prod(dimensions(selector)), deaths, selector)
for block, viewport, tile in zip(re.findall(r'\.malaria \.babies\s*\{([^}]+)', CSS), [320, 340], [160, 68]):
    height = float(re.search(r'height:\s*([\d.]+)px', block).group(1))
    close((height - viewport) / tile * 5, under_five, 'child-scroller maximum')
for block in re.findall(r'\.sixty-percent-people \.people\s*\{([^}]+)', CSS):
    height = float(re.search(r'height:\s*([\d.]+)px', block).group(1))
    close(height * 100, P['households_2025'] / 2, 'household-scroller count')

costs = [S['humanitarian_2026_launch_appeal'], S['malaria_annual_target_2025'] * S['malaria_years'], P['households_2025'] * S['small_household_grant'], P['poverty_2024'] * S['illustrative_poverty_grant'], S['nci_2026'] * S['cancer_years'], S['illustrative_water_fund'], P['households_2025'] * S['large_household_grant']]
assert costs == DATA['derived']['pie_costs']
circles = re.findall(r'<circle\b[^>]*class="piechart-inner"[^>]*/>', HTML)
assert len(circles) == len(costs)
for circle, cost in zip(circles, costs):
    assert 'pathLength="100"' in circle
    close(float(re.search(r'data-cost="([\d.]+)"', circle).group(1)), cost, 'pie cost')
    close(float(re.search(r'stroke-dasharray:\s*([\d.]+)', circle).group(1)), cost / W['forbes_400'] * 100, 'pie share', 1e-8)

bundle = [costs[6], costs[0], costs[1], costs[5], costs[4]]
total = sum(bundle)
close(total, DATA['derived']['final_total'], 'final bundle')
assert W['forbes_400_minimum'] * (1 - total / W['forbes_400']) > 1_000_000_000
assert f'{total / W["forbes_400"] * 100:.1f}%' in HTML

for language in ['', 'de/']:
    def chart(name):
        return ET.parse(ROOT / f'public/{language}img/{name}.svg')

    pie = chart('ninety')
    slices = pie.findall('.//s:path[@data-cost]', NS)
    assert sorted(float(p.get('data-cost')) for p in slices) == sorted(bundle)
    for path in slices:
        numbers = [float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', path.get('d'))]
        cx, cy, x1, y1, radius, _, _, large, sweep, x2, y2 = numbers
        angle = (math.atan2(y2-cy, x2-cx) - math.atan2(y1-cy, x1-cx)) % (2*math.pi)
        close(angle / (2*math.pi), float(path.get('data-cost')) / W['forbes_400'], 'final pie sector', 1e-8)
    remainder = ''.join(pie.find('.//s:g[@id="Graphic_48"]', NS).itertext())
    assert re.sub(r'[^\d]', '', remainder) == str(int(W['forbes_400'] - total))
    bars = chart('cares')
    green = bars.find('.//s:g[@id="Graphic_9"]/s:rect', NS)
    blue = bars.find('.//s:g[@id="Graphic_8"]/s:rect', NS)
    close(float(green.get('height')) / float(blue.get('height')), costs[2] / W['forbes_400'], 'household transfer bar', 1e-8)
    populations = chart('poverty')
    ids = {'California':'Graphic_2','Texas':'Graphic_4','Florida':'Graphic_9','New York':'Graphic_5','Pennsylvania':'Graphic_10','Illinois':'Graphic_11','Ohio':'Graphic_12'}
    for state, id in ids.items():
        width = populations.find(f'.//s:g[@id="{id}"]/s:rect', NS).get('width')
        close(float(width) * 100_000, P['states_2025'][state], state)
    close(float(populations.find('.//s:g[@id="Graphic_3"]/s:rect', NS).get('width')) * 100_000, P['poverty_2024'], 'poverty population')


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.nodes, self.stack = [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        node = {'tag': tag, 'attrs': attrs, 'text': '', 'parent': self.stack[-1] if self.stack else None}
        self.nodes.append(node)
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, -1, -1):
            if self.stack[i]['tag'] == tag:
                del self.stack[i:]
                break

    def handle_data(self, text):
        for node in self.stack:
            node['text'] += text


def plain(fragment):
    page = Page()
    page.feed('<div>' + fragment + '</div>')
    return re.sub(r'\s+', ' ', unescape(page.nodes[0]['text'])).strip()


page = Page()
page.feed(HTML)
english = json.loads((ROOT / 'data/english-updates.json').read_text())
german = json.loads((ROOT / 'data/german-updates.json').read_text())
assert english.keys() == german.keys()
translated = dict((key, json.loads(value)) for key, value in re.findall(r"'([^']+)'\s*:\s*(\"(?:[^\"\\]|\\.)*\")", (ROOT / 'public/de/i18n_de.js').read_text()))
for key, content in english.items():
    matches = [node for node in page.nodes if key in node['attrs'].get('class', '').split()]
    assert matches, key
    assert all(plain(node['text']) == plain(content) for node in matches), key
    assert translated[key] == german[key], key
    checks += 1

for relative in ['public/index.html', 'public/de/index.html']:
    template = Page()
    template.feed((ROOT / relative).read_text())
    for node in template.nodes:
        resource = node['attrs'].get('src') or (node['attrs'].get('href') if node['tag'] == 'link' else None)
        if resource and not re.match(r'\w+:|//', resource):
            assert (ROOT / relative).parent.joinpath(resource.split('?')[0]).is_file(), resource
MORE = json.loads((ROOT / 'data/musk-comparisons-2026-09-06.json').read_text())
inputs = MORE['inputs']
geometry = MORE['geometry']
visuals = {node['attrs']['data-comparison']: node for node in page.nodes if 'data-comparison' in node['attrs']}
assert len(visuals) == len(geometry)
assert set(visuals) == {item['id'] for item in geometry}


def inline_number(node, property):
    style = node['attrs'].get('style', '')
    return float(re.search(r'(?:^|;)\s*' + re.escape(property) + r':\s*([\d.]+)px', style).group(1))


for item in geometry:
    node = visuals[item['id']]
    width, height = (inline_number(node, prop) for prop in ('width', 'height'))
    close(float(node['attrs']['data-money']), item['value'], item['id'] + ' declared value')
    close(item['units'] * item['unit_value'], item['value'], item['id'] + ' unit total')
    if item['kind'] == 'grid':
        side, pitch = (inline_number(node, prop) for prop in ('--unit-side', '--unit-pitch'))
        rows, columns = (int(node['attrs'][prop]) for prop in ('data-rows', 'data-columns'))
        assert rows * columns == item['units'] == int(node['attrs']['data-units'])
        close(width / pitch, columns, item['id'] + ' columns')
        close(height / pitch, rows, item['id'] + ' rows')
        close(pitch - side, 2, item['id'] + ' unvalued gutter')
        close(side * side * 1000, item['unit_value'], item['id'] + ' unit area')
        colored_area = rows * columns * side * side
        assert height + 56 <= 440, item['id'] + ' obscures ruler'
    elif item['kind'] == 'stripes':
        stripe_width = float(re.search(r'transparent ([\d.]+)px', node['attrs']['style']).group(1))
        pitch = float(re.search(r'background-size:([\d.]+)px', node['attrs']['style']).group(1))
        close(width / pitch, item['units'], item['id'] + ' stripe count')
        close(pitch - stripe_width, 2, item['id'] + ' unvalued gutter')
        colored_area = item['units'] * stripe_width * height
        assert height + 56 <= 440, item['id'] + ' obscures ruler'
    else:
        colored_area = width * height
    close(colored_area * 1000, item['value'], item['id'] + ' colored area')


def group_total(prefix, field):
    return sum(item[field] for item in geometry if item['id'].startswith(prefix))


civic_price = inputs['civic_2026_lx_msrp'] + inputs['civic_destination']
close(float(visuals['thousand-civics']['attrs']['data-money']), civic_price * 1000, '1,000 cars purchased outright')
close(group_total('cars-', 'value'), civic_price * inputs['civic_large_quantity'], 'one million cars')
close(group_total('homes-', 'value'), inputs['homes'] * inputs['illustrative_home_price'], 'home purchases')
close(group_total('careers-', 'value'), inputs['careers'] * inputs['career_years'] * inputs['median_annual_wage_2025'], 'career fields')
close(group_total('rent-year-', 'value'), inputs['rent_households'] * inputs['rent_years'] * 12 * inputs['illustrative_monthly_rent'], 'ten years of rent')
close(group_total('food-', 'value'), inputs['grocery_households'] * inputs['grocery_weeks'] * inputs['illustrative_weekly_groceries'], 'a year of groceries')
close(float(visuals['million-debts']['attrs']['data-money']), inputs['debt_balances'] * inputs['illustrative_debt_balance'], 'credit-card balances')
close(group_total('time-off-', 'value'), inputs['year_off_recipients'] * inputs['illustrative_year_off_grant'], 'time-off grants')
close(group_total('decade-', 'value'), inputs['spending_years'] * inputs['illustrative_days_per_year'] * inputs['daily_spending'], 'century spending')
close(inputs['musk'], W['musk'], 'same fortune throughout')
assert '871.7 billion' in english['i18n-musk-spend-after']
assert '0.0029%' in english['i18n-musk-civic-thousand']
normalized_cars = civic_price * inputs['civic_sample_quantity'] / W['musk'] * 1000
assert 0 < normalized_cars < 0.03
assert 'less than 3 cents' in english['i18n-musk-more-perspective']
for key, cost in [('i18n-musk-cars-after', civic_price * inputs['civic_large_quantity']),
                  ('i18n-musk-homes-after', inputs['homes'] * inputs['illustrative_home_price'])]:
    assert f'{(1 - cost / W["musk"]) * 100:.1f}%' in english[key]
    checks += 1
bound_wealth = [float(node['attrs']['data-wealth']) for node in page.nodes if 'data-wealth' in node['attrs']]
assert bound_wealth == [W['musk'], W['forbes_400']]
bound_children = next(node['attrs']['data-count'] for node in page.nodes if node['attrs'].get('id') == 'babies-wrapper')
close(float(bound_children), under_five, 'child counter maximum')

# Fixed money geometry must fit without shrinking the original introduction.
# Flexible, sticky text intervals consume all remaining width, ending at Musk's edge.
continuation = next(node for node in page.nodes if node['attrs'].get('class') == 'musk-continuation')
scenes = [node for node in page.nodes if node['parent'] is continuation]
fixed_width, pauses = 0, 0
for scene in scenes:
    classes = scene['attrs']['class'].split()
    if 'musk-pause' in classes:
        pauses += 1
    elif 'musk-years' in classes:
        children = [node for node in page.nodes if node['parent'] is scene]
        fixed_width += sum(inline_number(node, 'width') for node in children) + 20 * (len(children) - 1)
    else:
        fixed_width += inline_number(scene, 'width')
layout = MORE['layout']
assert pauses == layout['pause_count'] and len(scenes) == layout['scene_count']
required_width = fixed_width + pauses * layout['minimum_pause_width'] + (len(scenes) - 1) * layout['scene_gap']
assert required_width + layout['preexisting_content_width_upper_bound'] < dimensions('.bezos .wealth')[0]
assert set(MORE['translation_keys']).issubset(english.keys() & german.keys())
for node in visuals.values():
    label = node['attrs'].get('aria-labelledby')
    if label:
        assert any(candidate['attrs'].get('id') == label for candidate in page.nodes), label
print(f'Passed {checks} data checks, {len(geometry)} new scaled visuals, both translations, layout capacity, and local assets.')
