import {
  assertAuthState,
  expect,
  test,
} from '../e2e-test-helpers';

test.describe('機関誌配布マップのe2eテスト', () => {
  test('機関誌配布マップ遷移が正常に動作する', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    // 機関誌配布マップに遷移
    await signedInPage.getByTestId('usermenubutton').click();
    await signedInPage.getByText('機関誌配布マップ').click();
    await expect(signedInPage).toHaveURL(/\/map\/posting/, { timeout: 10000 });
  });
});
