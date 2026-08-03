/**
 * @module hia-uview-p55-attachment.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 caller file-state、crop geometry 和 verification-request intent；不启动 chooser、Canvas、网络、timer、storage 或平台 API。
 * @lang en Uses the real Vue runtime to verify caller file-state, crop geometry, and verification-request intent; it starts no chooser, Canvas, network, timer, storage, or platform API.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UAvatarCropper, UUpload, UVerificationCode } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 验证文件状态只产生 caller-record intent，不取得 chooser 或文件操作职责。
 * @lang en Verifies that file state produces caller-record intent only and acquires no chooser or file-operation responsibility.
 */
describe('controlled file-state surface', () => {
  /**
   * @lang zh-CN 验证 select 报告槽位、retry 仅针对 error record，且 payload 原样携带 caller source。
   * @lang en Verifies that select reports slots, retry targets only error record, and payload carries caller source unchanged.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('reports bounded file intents without chooser or upload work', async () => {
    // <lang><zh-CN>两条本地记录只是可读状态，不包含路径、bytes 或异步任务。</zh-CN><en>The two local records are readable state only and contain no path, bytes, or async task.</en></lang>
    const files = [{ label: 'Ready record', status: 'ready' }, { label: 'Error record', status: 'error' }];
    const upload = mount(UUpload, { props: { visible: true, files, max: 3, selectText: 'Select', previewText: 'Preview', retryText: 'Retry' } });
    await upload.get('button.u-upload__select').trigger('click');
    await upload.findAll('button.u-upload__retry')[0].trigger('click');
    expect(upload.emitted('select')[0][0].remainingSlots).toBe(1);
    expect(upload.emitted('retry')[0][0].file).toStrictEqual(files[1]);
  });
});

/**
 * @lang zh-CN 验证裁剪组件只报告受限几何，而不生成图片或文件结果。
 * @lang en Verifies that crop component reports constrained geometry only and generates no image or file result.
 */
describe('controlled crop-geometry surface', () => {
  /**
   * @lang zh-CN 验证 caller delta 形成下一比例几何，确认只回传当前 caller geometry。
   * @lang en Verifies that caller delta forms next proportional geometry and confirm returns current caller geometry only.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('reports bounded geometry without pixel processing', async () => {
    // <lang><zh-CN>测试源只是展示字符串；测试不加载图片也不生成二进制。</zh-CN><en>The test source is presentation string only; the test loads no image and generates no binary.</en></lang>
    const cropper = mount(UAvatarCropper, { props: { visible: true, src: 'caller-source', alt: 'Caller image', geometry: { x: 0, y: 0, width: 0.5, height: 0.5 }, adjustments: [{ label: 'Move right', delta: { x: 0.3 } }], confirmText: 'Confirm' } });
    await cropper.get('button.u-avatar-cropper__adjustment').trigger('click');
    await cropper.get('button.u-avatar-cropper__confirm').trigger('click');
    expect(cropper.emitted('crop-change')[0][0].geometry).toEqual({ x: 0.3, y: 0, width: 0.5, height: 0.5 });
    expect(cropper.emitted('confirm')[0][0].geometry).toEqual({ x: 0, y: 0, width: 0.5, height: 0.5 });
  });
});

/**
 * @lang zh-CN 验证验证码组件只在 caller 显式允许时报告 request，并且 remaining 不形成 timer。
 * @lang en Verifies that verification component reports request only when caller explicitly permits it and remaining forms no timer.
 */
describe('controlled verification-request surface', () => {
  /**
   * @lang zh-CN 验证 request payload 返回有限当前快照，不发送验证码或改写 enabled。
   * @lang en Verifies that request payload returns finite current snapshot and neither sends a code nor rewrites enabled.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('reports explicitly enabled request without countdown work', async () => {
    // <lang><zh-CN>remaining 只作为 caller snapshot 传入；无 status/timer 服务参与。</zh-CN><en>Remaining enters only as caller snapshot; no status/timer service participates.</en></lang>
    const code = mount(UVerificationCode, { props: { visible: true, remainingSeconds: 90, remainingText: 'Caller remaining', requestText: 'Request', requestEnabled: true } });
    await code.get('button.u-verification-code__request').trigger('click');
    expect(code.emitted('request')[0][0].remainingSeconds).toBe(90);
  });
});
