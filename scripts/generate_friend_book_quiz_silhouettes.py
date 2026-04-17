from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / 'public' / 'images' / 'friend-book-quiz' / 'Painting exam'
OUTPUT_DIR = ROOT / 'public' / 'images' / 'friend-book-quiz'
CANVAS_SIZE = 640
BACKGROUND_COLOR = (239, 226, 207, 255)
FOREGROUND_COLOR = (40, 33, 30, 255)

Point = tuple[float, float]
MaskMode = Literal['add', 'subtract']
MaskSource = Literal['grabcut', 'threshold']


@dataclass(frozen=True)
class PolygonOperation:
    mode: MaskMode
    points: tuple[Point, ...]


@dataclass(frozen=True)
class EllipseOperation:
    mode: MaskMode
    center: Point
    axes: Point
    angle: float = 0.0


@dataclass(frozen=True)
class SilhouetteConfig:
    source_name: str
    output_name: str
    source_mode: MaskSource
    crop: tuple[float, float, float, float]
    rect: tuple[float, float, float, float] | None
    scale: float
    offset_x: float = 0.0
    offset_y: float = 0.0
    blur: int = 9
    close_kernel: int = 9
    open_kernel: int = 5
    min_component_ratio: float = 0.003
    threshold_value: int | None = None
    threshold_invert: bool = False
    fill_largest_component: bool = False
    final_close_kernel: int = 7
    polygon_operations: tuple[PolygonOperation, ...] = field(default_factory=tuple)
    ellipse_operations: tuple[EllipseOperation, ...] = field(default_factory=tuple)


CONFIGS = [
    SilhouetteConfig(
        source_name='蒙娜丽莎.webp',
        output_name='mona-lisa-shadow.png',
        source_mode='grabcut',
        crop=(0.14, 0.02, 0.86, 0.98),
        rect=(0.12, 0.05, 0.76, 0.88),
        scale=0.78,
        offset_y=0.03,
        blur=11,
        close_kernel=11,
        open_kernel=3,
        final_close_kernel=13,
        ellipse_operations=(
            EllipseOperation('add', (0.50, 0.67), (0.17, 0.24)),
            EllipseOperation('add', (0.39, 0.72), (0.12, 0.05), 24),
            EllipseOperation('add', (0.60, 0.73), (0.13, 0.05), -24),
            EllipseOperation('add', (0.50, 0.80), (0.20, 0.07)),
            EllipseOperation('subtract', (0.50, 0.49), (0.05, 0.03)),
            EllipseOperation('subtract', (0.55, 0.76), (0.035, 0.018), 18),
        ),
    ),
    SilhouetteConfig(
        source_name='拿破仑.jpg',
        output_name='napoleon-crossing-the-alps-shadow.png',
        source_mode='grabcut',
        crop=(0.0, 0.0, 1.0, 1.0),
        rect=(0.08, 0.04, 0.84, 0.9),
        scale=0.86,
        offset_x=0.01,
        offset_y=0.04,
        blur=7,
        close_kernel=9,
        open_kernel=3,
        min_component_ratio=0.001,
        final_close_kernel=7,
    ),
    SilhouetteConfig(
        source_name='本杰明·富兰克林.jpeg',
        output_name='benjamin-franklin-shadow.png',
        source_mode='threshold',
        crop=(0.0, 0.0, 1.0, 1.0),
        rect=None,
        scale=0.82,
        offset_y=0.03,
        blur=0,
        close_kernel=13,
        open_kernel=3,
        threshold_value=170,
        threshold_invert=True,
        final_close_kernel=9,
        polygon_operations=(
            PolygonOperation(
                'subtract',
                (
                    (0.53, 0.30),
                    (0.67, 0.29),
                    (0.69, 0.37),
                    (0.67, 0.52),
                    (0.56, 0.58),
                    (0.49, 0.50),
                ),
            ),
        ),
    ),
    SilhouetteConfig(
        source_name='费曼先生.jpeg',
        output_name='richard-feynman-shadow.png',
        source_mode='threshold',
        crop=(0.0, 0.0, 1.0, 1.0),
        rect=None,
        scale=0.80,
        offset_y=0.02,
        blur=0,
        close_kernel=9,
        open_kernel=3,
        threshold_value=120,
        threshold_invert=False,
        final_close_kernel=11,
        polygon_operations=(
            PolygonOperation(
                'add',
                (
                    (0.48, 0.63),
                    (0.53, 0.63),
                    (0.56, 0.92),
                    (0.46, 0.92),
                ),
            ),
            PolygonOperation(
                'subtract',
                (
                    (0.52, 0.59),
                    (0.57, 0.62),
                    (0.55, 0.84),
                    (0.50, 0.80),
                ),
            ),
        ),
        ellipse_operations=(
            EllipseOperation('subtract', (0.58, 0.41), (0.045, 0.028)),
            EllipseOperation('subtract', (0.52, 0.56), (0.03, 0.02), -10),
        ),
    ),
]


def crop_image(image: np.ndarray, crop: tuple[float, float, float, float]) -> np.ndarray:
    height, width = image.shape[:2]
    left = max(0, min(width - 1, int(width * crop[0])))
    top = max(0, min(height - 1, int(height * crop[1])))
    right = max(left + 1, min(width, int(width * crop[2])))
    bottom = max(top + 1, min(height, int(height * crop[3])))
    return image[top:bottom, left:right]


def create_grabcut_mask(image: np.ndarray, rect_ratio: tuple[float, float, float, float]) -> np.ndarray:
    height, width = image.shape[:2]
    rect = (
        max(1, int(width * rect_ratio[0])),
        max(1, int(height * rect_ratio[1])),
        max(2, int(width * rect_ratio[2])),
        max(2, int(height * rect_ratio[3])),
    )

    mask = np.zeros((height, width), np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(image, mask, rect, bgd_model, fgd_model, 8, cv2.GC_INIT_WITH_RECT)
    return np.where(
        (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD),
        255,
        0,
    ).astype(np.uint8)


def create_threshold_mask(
    image: np.ndarray,
    threshold_value: int,
    threshold_invert: bool,
) -> np.ndarray:
    grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    threshold_type = cv2.THRESH_BINARY_INV if threshold_invert else cv2.THRESH_BINARY
    _, mask = cv2.threshold(grayscale, threshold_value, 255, threshold_type)
    return mask


def keep_large_components(mask: np.ndarray, min_component_ratio: float) -> np.ndarray:
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    result = np.zeros_like(mask)
    min_pixels = int(mask.shape[0] * mask.shape[1] * min_component_ratio)

    for label in range(1, num_labels):
        area = stats[label, cv2.CC_STAT_AREA]
        if area >= min_pixels:
            result[labels == label] = 255

    if result.max() == 0:
        return mask

    return result


def fill_largest_component(mask: np.ndarray) -> np.ndarray:
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return mask

    result = np.zeros_like(mask)
    cv2.drawContours(result, [max(contours, key=cv2.contourArea)], -1, 255, thickness=cv2.FILLED)
    return result


def clean_mask(mask: np.ndarray, config: SilhouetteConfig) -> np.ndarray:
    if config.blur > 0:
        blurred = cv2.GaussianBlur(mask, (config.blur, config.blur), 0)
    else:
        blurred = mask

    _, thresholded = cv2.threshold(blurred, 120, 255, cv2.THRESH_BINARY)
    close_kernel = np.ones((config.close_kernel, config.close_kernel), np.uint8)
    open_kernel = np.ones((config.open_kernel, config.open_kernel), np.uint8)
    closed = cv2.morphologyEx(thresholded, cv2.MORPH_CLOSE, close_kernel)
    opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, open_kernel)
    large_components = keep_large_components(opened, config.min_component_ratio)

    if config.fill_largest_component:
        return fill_largest_component(large_components)

    return large_components


def fit_to_canvas(mask: np.ndarray, config: SilhouetteConfig) -> np.ndarray:
    ys, xs = np.where(mask > 0)
    if xs.size == 0 or ys.size == 0:
        raise RuntimeError(f'No foreground pixels found for {config.source_name}')

    left, right = xs.min(), xs.max()
    top, bottom = ys.min(), ys.max()
    subject = mask[top : bottom + 1, left : right + 1]

    subject_h, subject_w = subject.shape
    target = int(CANVAS_SIZE * config.scale)
    scale = min(target / subject_w, target / subject_h)
    resized = cv2.resize(
        subject,
        (max(1, int(subject_w * scale)), max(1, int(subject_h * scale))),
        interpolation=cv2.INTER_AREA,
    )

    canvas = np.zeros((CANVAS_SIZE, CANVAS_SIZE), dtype=np.uint8)
    x = int((CANVAS_SIZE - resized.shape[1]) / 2 + config.offset_x * CANVAS_SIZE)
    y = int((CANVAS_SIZE - resized.shape[0]) / 2 + config.offset_y * CANVAS_SIZE)
    x = max(0, min(CANVAS_SIZE - resized.shape[1], x))
    y = max(0, min(CANVAS_SIZE - resized.shape[0], y))
    canvas[y : y + resized.shape[0], x : x + resized.shape[1]] = resized
    return canvas


def apply_polygon_operation(mask: np.ndarray, operation: PolygonOperation) -> None:
    points = np.array(
        [[int(x * CANVAS_SIZE), int(y * CANVAS_SIZE)] for x, y in operation.points],
        dtype=np.int32,
    )
    color = 255 if operation.mode == 'add' else 0
    cv2.fillPoly(mask, [points], color)


def apply_ellipse_operation(mask: np.ndarray, operation: EllipseOperation) -> None:
    center = (int(operation.center[0] * CANVAS_SIZE), int(operation.center[1] * CANVAS_SIZE))
    axes = (int(operation.axes[0] * CANVAS_SIZE), int(operation.axes[1] * CANVAS_SIZE))
    color = 255 if operation.mode == 'add' else 0
    cv2.ellipse(mask, center, axes, operation.angle, 0, 360, color, thickness=cv2.FILLED)


def apply_operations(mask: np.ndarray, config: SilhouetteConfig) -> np.ndarray:
    result = mask.copy()

    for operation in config.polygon_operations:
        apply_polygon_operation(result, operation)

    for operation in config.ellipse_operations:
        apply_ellipse_operation(result, operation)

    if config.final_close_kernel > 1:
        kernel = np.ones((config.final_close_kernel, config.final_close_kernel), np.uint8)
        result = cv2.morphologyEx(result, cv2.MORPH_CLOSE, kernel)

    return result


def render_silhouette(mask: np.ndarray, output_path: Path) -> None:
    image = np.zeros((CANVAS_SIZE, CANVAS_SIZE, 4), dtype=np.uint8)
    bgra_background = (BACKGROUND_COLOR[2], BACKGROUND_COLOR[1], BACKGROUND_COLOR[0], BACKGROUND_COLOR[3])
    bgra_foreground = (FOREGROUND_COLOR[2], FOREGROUND_COLOR[1], FOREGROUND_COLOR[0], FOREGROUND_COLOR[3])
    image[:] = bgra_background
    image[mask > 0] = bgra_foreground
    cv2.imwrite(str(output_path), image)


def create_base_mask(image: np.ndarray, config: SilhouetteConfig) -> np.ndarray:
    if config.source_mode == 'grabcut':
        if config.rect is None:
            raise RuntimeError(f'grabcut requires rect for {config.source_name}')
        return create_grabcut_mask(image, config.rect)

    if config.threshold_value is None:
        raise RuntimeError(f'threshold mode requires threshold_value for {config.source_name}')

    return create_threshold_mask(image, config.threshold_value, config.threshold_invert)


def generate(config: SilhouetteConfig) -> None:
    source_path = SOURCE_DIR / config.source_name
    output_path = OUTPUT_DIR / config.output_name
    image = cv2.imread(str(source_path), cv2.IMREAD_COLOR)

    if image is None:
        raise RuntimeError(f'Unable to read {source_path}')

    cropped = crop_image(image, config.crop)
    base_mask = create_base_mask(cropped, config)
    cleaned_mask = clean_mask(base_mask, config)
    fitted_mask = fit_to_canvas(cleaned_mask, config)
    final_mask = apply_operations(fitted_mask, config)
    render_silhouette(final_mask, output_path)
    print(f'Wrote {output_path.relative_to(ROOT)}')


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for config in CONFIGS:
        generate(config)


if __name__ == '__main__':
    main()
